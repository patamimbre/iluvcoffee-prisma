import { Module } from "@nestjs/common";

import { PrismaModule } from "@src/core/prisma/prisma.module";

import { CoffeesController } from "./coffees.controller";
import { CoffeesService } from "./coffees.service";

@Module({
  controllers: [CoffeesController],
  providers: [CoffeesService],
  imports: [PrismaModule],
})
export class CoffeesModule {}
