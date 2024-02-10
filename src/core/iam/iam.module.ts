import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";

import { AuthenticationController } from "./authentication/authentication.controller";
import { AuthenticationService } from "./authentication/authentication.service";
import { AccessTokenGuard } from "./authentication/guards/access-token.guard";
import { AuthenticationGuard } from "./authentication/guards/authentication.guard";
import { RefreshTokenIdsStorage } from "./authentication/refresh-token-ids.storage";
import jwtConfig from "./config/jwt.config";
import redisConfig from "./config/redis.config";
import { ArgonService } from "./hashing/argon.service";
import { HashingService } from "./hashing/hashing.service";

@Module({
  imports: [
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(redisConfig),
  ],
  providers: [
    {
      provide: HashingService,
      useClass: ArgonService,
    },
    {
      // All the routes in the module will be protected by the AccessTokenGuard by default
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    AccessTokenGuard,
    AuthenticationService,
    RefreshTokenIdsStorage,
  ],
  controllers: [AuthenticationController],
})
export class IamModule {}
