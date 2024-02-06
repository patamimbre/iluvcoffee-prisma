import * as Prisma from "@prisma/client";

export class Flavor implements Prisma.Flavor {
  id!: number;
  name!: string;
  coffees?: Prisma.Coffee[];
}
