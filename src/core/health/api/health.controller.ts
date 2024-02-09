import { Controller, Get, HttpCode, Inject, Logger } from "@nestjs/common";

import { Auth } from "@src/core/iam/authentication/decorators/auth.decorator";
import { AuthType } from "@src/core/iam/enums/auth-type.enum";

@Auth(AuthType.None)
@Controller("health")
export class HealthController {
  constructor(@Inject(Logger) private readonly logger: Logger) {}

  @Get()
  @HttpCode(200)
  run() {
    this.logger.log("Health endpoint called!");
    return { status: "ok" };
  }
}
