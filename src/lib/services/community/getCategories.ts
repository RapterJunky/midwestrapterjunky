import "server-only";
import { unstable_cache } from "next/cache";
import prisma from "@/lib/api/prisma";

const getCategories = unstable_cache(
  async () => prisma.thread.findMany({
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
  }),
  undefined,
  {
    tags: ["community-categories"],
    revalidate: 600,
  },
);

export default getCategories;
