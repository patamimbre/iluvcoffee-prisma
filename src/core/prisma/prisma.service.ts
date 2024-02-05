import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  // The onModuleInit is optional — if you leave it out, Prisma will connect lazily on its first call to the database
  async onModuleInit() {
    await this.$connect();
  }

  // Need some research on this is called or not when the app is shutting down
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
