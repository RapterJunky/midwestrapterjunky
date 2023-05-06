import { Prisma, PrismaClient } from "@prisma/client";
//import { paginate } from "./prismaPagination";
import { paginate } from 'prisma-extension-pagination';

type PrismaModel = {
  findFirst: CallableFunction;
};


//https://echobind.com/post/extending-types-for-prisma-extensions-in-nextjs
const getExtendPrismaClient = () => {

  return new PrismaClient().$extends(Prisma.defineExtension({
    name: "pagination",
    model: {
      $allModels: {
        paginate,
      },
    },
  })).$extends(Prisma.defineExtension({
    name: "exists",
    model: {
      $allModels: {
        exists: async function <T, E extends Error>(
          this: T,
          where: Prisma.Args<T, "findFirst">,
          throws?: E
        ): Promise<boolean> {
          const result = (await (this as PrismaModel).findFirst(where)) as object;
          if (throws && !result) throw throws;
          return !!result;
        },
      },
    },
  }));
};

type ExtendPrismaClient = ReturnType<typeof getExtendPrismaClient>;
type Global = typeof globalThis & { prisma: ExtendPrismaClient };

let prisma: ExtendPrismaClient;

if (process.env.VERCEL_ENV !== "development") {
  prisma = getExtendPrismaClient();
} else {
  if (!(global as Global)?.prisma) {
    (global as Global).prisma = getExtendPrismaClient();
  }
  prisma = (global as Global).prisma;
}

export default prisma;