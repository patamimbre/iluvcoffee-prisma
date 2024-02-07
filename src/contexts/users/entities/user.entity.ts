import * as Prisma from "@prisma/client";

export class User implements Prisma.User {
  id!: number;
  email!: string;
  password!: string;
}
