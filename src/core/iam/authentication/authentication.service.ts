import { randomUUID } from "node:crypto";

import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "nestjs-prisma";

import { User } from "@src/contexts/users/entities/user.entity";

import jwtConfig from "../config/jwt.config";
import { HashingService } from "../hashing/hashing.service";
import { ActiveUserData, TokenResponse } from "../iam.types";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { SignInDto } from "./dto/sign-in.dto";
import { SignUpDto } from "./dto/sign-up.dto";
import {
  InvalidatedRefreshTokenError,
  RefreshTokenIdsStorage,
} from "./refresh-token-ids.storage";

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly refreshTokenIdsStorage: RefreshTokenIdsStorage,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<void> {
    const { email, password } = signUpDto;
    const hashedPassword = await this.hashingService.hash(password);

    await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
  }

  async signIn(signInDto: SignInDto): Promise<TokenResponse> {
    const error = new UnauthorizedException("Invalid credentials");

    const { email, password } = signInDto;
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw error;
    }

    const isPasswordValid = await this.hashingService.compare(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw error;
    }

    return this.generateTokens(user);
  }

  private async generateTokens(user: User): Promise<TokenResponse> {
    const refreshTokenId = randomUUID();

    const { id: userId, email: emailPayload } = user;
    const [accessToken, refreshToken] = await Promise.all([
      this.signToken<Partial<ActiveUserData>>(
        userId,
        this.jwtConfiguration.accessTokenTtl,
        { email: emailPayload },
      ),
      this.signToken(userId, this.jwtConfiguration.refreshTokenTtl, {
        refreshTokenId,
      }),
    ]);

    await this.refreshTokenIdsStorage.insert(userId, refreshTokenId);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<TokenResponse> {
    try {
      const { sub: id, refreshTokenId } = await this.jwtService.verifyAsync<
        Pick<ActiveUserData, "sub"> & { refreshTokenId: string }
      >(refreshTokenDto.refreshToken, {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        secret: this.jwtConfiguration.secret,
      });

      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!user) throw new UnauthorizedException();

      const isValid = await this.refreshTokenIdsStorage.validate(
        id,
        refreshTokenId,
      );

      // If the refresh token is not valid, we should throw an UnauthorizedException
      if (!isValid) throw new UnauthorizedException("Invalid refresh token");
      // If the refresh token is valid, we should invalidate it and generate new tokens
      await this.refreshTokenIdsStorage.invalidate(id);

      return this.generateTokens(user);
    } catch (error) {
      if (error instanceof InvalidatedRefreshTokenError) {
        // Take action: notify the user that the refresh token might have been compromised
        throw new UnauthorizedException("Access denied");
      }
      throw new UnauthorizedException();
    }
  }

  private signToken<T>(
    userId: number,
    expiresIn: number,
    payload?: T,
  ): Promise<string> {
    return this.jwtService.signAsync(
      {
        sub: userId,
        ...payload,
      },
      {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        secret: this.jwtConfiguration.secret,
        expiresIn,
      },
    );
  }
}
