import * as Prisma from "@prisma/client";

export class Coffee implements Prisma.Coffee {
  id!: number;
  name!: string;
  brand!: string;
  flavors?: Prisma.Flavor[];
}
