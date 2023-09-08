import "server-only";
import { cache } from "react";
import prisma from "@/lib/api/prisma";

const getCategories = cache(async () => {
  return prisma.thread.findMany({
    select: {
      description: true,
      id: true,
      image: true,
      name: true,
      tags: true,
      _count: {
        select: {
          posts: true,
        },
      },
      posts: {
        take: 5,
        orderBy: {
          pinned: "desc",
        },
        select: {
          name: true,
          id: true,
          pinned: true,
          locked: true,
          createdAt: true,
        },
      },
    },
  });
});

export default getCategories;
