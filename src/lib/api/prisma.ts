import paginate from "./pagination";
import { PrismaClient } from "@prisma/client";

//https://echobind.com/post/extending-types-for-prisma-extensions-in-nextjs
const prismaClientSingleton = () => {
  return new PrismaClient().$extends(paginate);
};

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.VERCEL_ENV === "development") globalThis.prismaGlobal = prisma;
