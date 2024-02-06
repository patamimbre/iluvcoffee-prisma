/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { PrismaClient } from "@prisma/client";

// initialize Prisma Client
const prisma = new PrismaClient();

async function main() {
  await prisma.flavor.createMany({
    data: [{ name: "Vanilla" }, { name: "Caramel" }, { name: "Chocolate" }],
  });

  // create two dummy coffees
  const coffee1 = await prisma.coffee.upsert({
    where: { name: "Delicious Coffee" },
    update: {},
    create: {
      name: "Delicious Coffee",
      brand: "Nestle",
      flavors: { connect: [{ name: "Vanilla" }, { name: "Chocolate" }] },
    },
  });

  const coffee2 = await prisma.coffee.upsert({
    where: { name: "Espresso" },
    update: {},
    create: {
      name: "Espresso",
      brand: "Starbucks",
      flavors: { connect: [{ name: "Vanilla" }, { name: "Caramel" }] },
    },
  });

  console.log({ coffee1, coffee2 });
}

// execute the main function
main()
  .catch(error => {
    console.error(error);
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1);
  })
  .finally(async () => {
    // close Prisma Client at the end
    await prisma.$disconnect();
  });
