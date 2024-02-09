import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { FastifyRequest } from "fastify";

import jwtConfig from "../../config/jwt.config";
import { BEARER_PREFIX, REQUEST_USER_KEY } from "../../iam.constants";
import { FastifyRequestWithPayload, JwtPayload } from "../../iam.types";

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<FastifyRequestWithPayload>();
    const token = this.extractTokenFromRequest(request);

    if (!token) throw new UnauthorizedException();

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        token,
        this.jwtConfiguration,
      );
      request[REQUEST_USER_KEY] = payload;
    } catch {
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractTokenFromRequest(request: FastifyRequest): string | undefined {
    const authorizationHeader = request.headers.authorization;
    if (!authorizationHeader) return;

    const [type, token] = authorizationHeader.split(" ");
    if (type !== BEARER_PREFIX) return;

    return token;
  }
}
