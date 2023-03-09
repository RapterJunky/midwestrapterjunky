import { Prisma, PrismaClient } from "@prisma/client";
import type { Comment, Thread, ThreadPost, User } from "@prisma/client";

declare global {
  var prisma: PrismaClient;
}

let prisma: PrismaClient;

if (process.env.VERCEL_ENV !== "development") {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export type { Comment, Thread, ThreadPost, User };
export default prisma;
