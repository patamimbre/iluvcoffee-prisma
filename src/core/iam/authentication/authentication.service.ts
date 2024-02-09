import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "nestjs-prisma";

import jwtConfig from "../config/jwt.config";
import { HashingService } from "../hashing/hashing.service";
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

  async signIn(signInDto: SignInDto): Promise<{ accessToken: string }> {
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

    const accessToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
      },
      {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        expiresIn: this.jwtConfiguration.accessTokenTtl,
        secret: this.jwtConfiguration.secret,
      },
    );

    return { accessToken };
  }
}
