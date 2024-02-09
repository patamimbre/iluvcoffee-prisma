import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";

import { AuthType } from "../enums/auth-type.enum";
import { AuthenticationService } from "./authentication.service";
import { Auth } from "./decorators/auth.decorator";
import { SignInDto } from "./dto/sign-in.dto";
import { SignUpDto } from "./dto/sign-up.dto";

@Auth(AuthType.None)
@Controller("authentication")
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post("sign-up")
  async signUp(@Body() signUpDto: SignUpDto): Promise<void> {
    return this.authenticationService.signUp(signUpDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post("sign-in")
  async signIn(@Body() signInDto: SignInDto) {
    return this.authenticationService.signIn(signInDto);
  }
}
