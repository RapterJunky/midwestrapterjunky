import { Prisma, PrismaClient } from "@prisma/client";
import type {
  Comment,
  Thread,
  ThreadPost,
  User,
  Authors,
} from "@prisma/client";
import pagination from "prisma-extension-pagination";

type PrismaModel = {
  findFirst: CallableFunction;
};

const existsExtension = Prisma.defineExtension({
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
});

//https://echobind.com/post/extending-types-for-prisma-extensions-in-nextjs
const getExtendPrismaClient = () => {
  return new PrismaClient().$extends(pagination).$extends(existsExtension);
};

type ExtendPrismaClient = ReturnType<typeof getExtendPrismaClient>;
type Global = typeof globalThis & { prisma: ExtendPrismaClient };

let prisma: ExtendPrismaClient;

if (process.env.VERCEL_ENV !== "development") {
  prisma = getExtendPrismaClient();
} else {
  if (!(global as Global).prisma) {
    (global as Global).prisma = getExtendPrismaClient();
  }
  prisma = (global as Global).prisma;
}

export type { Comment, Thread, ThreadPost, User, Authors };
export default prisma;
