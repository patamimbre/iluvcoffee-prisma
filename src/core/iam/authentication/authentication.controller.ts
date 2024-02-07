import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";

import { AuthenticationService } from "./authentication.service";
import { SignInDto } from "./dto/sign-in.dto";
import { SignUpDto } from "./dto/sign-up.dto";

@Controller("authentication")
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post("sign-up")
  async signUp(@Body() signUpDto: SignUpDto): Promise<void> {
    return this.authenticationService.signUp(signUpDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post("sign-in")
  async signIn(@Body() signInDto: SignInDto): Promise<void> {
    return this.authenticationService.signIn(signInDto);
  }
}
