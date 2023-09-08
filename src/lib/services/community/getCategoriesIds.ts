import "server-only";
import { cache } from "react";
import prisma from "@/lib/api/prisma";

const getCategoriesIds = cache(async () => {
  return prisma.thread.findMany({
    select: {
      id: true,
      name: true,
    },
  });
});

export default getCategoriesIds;
