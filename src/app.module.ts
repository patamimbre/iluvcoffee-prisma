import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import {
  loggingMiddleware,
  PrismaModule,
  providePrismaClientExceptionFilter,
} from "nestjs-prisma";

import { HealthModule } from "@core/health/health.module";
import { LoggerModule } from "@core/logger/logger.module";

import { CoffeesModule } from "./contexts/coffees/coffees.module";
import { UsersModule } from "./contexts/users/users.module";
import { IamModule } from "./core/iam/iam.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true }),
    PrismaModule.forRoot({
      isGlobal: true,
      prismaServiceOptions: { middlewares: [loggingMiddleware()] },
    }),
    LoggerModule,
    HealthModule,
    CoffeesModule,
    UsersModule,
    IamModule,
  ],
  providers: [providePrismaClientExceptionFilter()],
})
export class AppModule {}
