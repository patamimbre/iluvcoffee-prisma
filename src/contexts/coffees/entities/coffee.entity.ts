import { Coffee as PrismaCoffee } from "@prisma/client";

export class Coffee implements PrismaCoffee {
  id!: number;
  name!: string;
  brand!: string;
  flavors!: string[];
}
