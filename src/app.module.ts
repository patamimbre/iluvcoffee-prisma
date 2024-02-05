import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { HealthModule } from "@core/health/health.module";
import { LoggerModule } from "@core/logger/logger.module";

import { UserModule } from "@contexts/users/user.module";

import { CoffeesModule } from "./contexts/coffees/coffees.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true }),
    LoggerModule,
    HealthModule,
    UserModule,
    CoffeesModule,
  ],
})
export class AppModule {}
