import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { AuthType } from "../../enums/auth-type.enum";
import { AccessTokenGuard } from "./access-token.guard";

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private static readonly defaultAuthType = AuthType.Bearer;
  private readonly authTypeGuardMap: Record<
    AuthType,
    CanActivate | CanActivate[]
  >;

  constructor(
    private readonly reflector: Reflector,
    private readonly accessTokenGuard: AccessTokenGuard,
  ) {
    this.authTypeGuardMap = {
      [AuthType.Bearer]: this.accessTokenGuard,
      [AuthType.None]: { canActivate: () => true },
    };
  }

  canActivate(context: ExecutionContext): Promise<boolean> {
    const authType = this.reflector.getAllAndOverride<AuthType[]>("authType", [
      context.getHandler(),
      context.getClass(),
    ]) || [AuthenticationGuard.defaultAuthType];

    const guards = authType.flatMap(type => this.authTypeGuardMap[type]);

    return this.runGuards(context, guards);
  }

  private async runGuards(
    context: ExecutionContext,
    guards: CanActivate[],
  ): Promise<boolean> {
    for (const guard of guards) {
      const result = await guard.canActivate(context);
      if (!result) {
        throw new UnauthorizedException();
      }
    }

    return true;
  }
}
