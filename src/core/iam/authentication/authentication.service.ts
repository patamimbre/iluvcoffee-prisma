import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "nestjs-prisma";

import { HashingService } from "../hashing/hashing.service";
import { SignInDto } from "./dto/sign-in.dto";
import { SignUpDto } from "./dto/sign-up.dto";

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hashingService: HashingService,
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

  async signIn(signInDto: SignInDto): Promise<void> {
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

    return;
  }
}
