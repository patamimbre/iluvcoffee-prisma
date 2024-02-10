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

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
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
    const { id: userId, email: emailPayload } = user;
    const accessTokenPromise = this.signToken<Partial<ActiveUserData>>(
      userId,
      this.jwtConfiguration.accessTokenTtl,
      { email: emailPayload },
    );
    const refreshTokenPromise = this.signToken(
      userId,
      this.jwtConfiguration.refreshTokenTtl,
    );

    return {
      accessToken: await accessTokenPromise,
      refreshToken: await refreshTokenPromise,
    };
  }

  async refreshTokens(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<TokenResponse> {
    try {
      const { sub: id } = await this.jwtService.verifyAsync<
        Pick<ActiveUserData, "sub">
      >(refreshTokenDto.refreshToken, {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        secret: this.jwtConfiguration.secret,
      });

      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!user) throw new UnauthorizedException();
      return this.generateTokens(user);
    } catch {
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
