import { Module } from "@nestjs/common";

import { AuthenticationController } from "./authentication/authentication.controller";
import { AuthenticationService } from "./authentication/authentication.service";
import { ArgonService } from "./hashing/argon.service";
import { HashingService } from "./hashing/hashing.service";

@Module({
  providers: [
    {
      provide: HashingService,
      useClass: ArgonService,
    },
    AuthenticationService,
  ],
  controllers: [AuthenticationController],
})
export class IamModule {}
