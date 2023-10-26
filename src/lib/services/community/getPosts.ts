import "server-only";
import { cache } from "react";
import prisma from "@/lib/api/prisma";

// Revalidate at most every 10 mins
export const revalidate = 60;

const getPosts = cache(async (sort: "latest" | "top") => {
  const posts = await prisma.threadPost.findMany({
    take: 15,
    select: {
      id: true,
      name: true,
      locked: true,
      pinned: true,
      tags: true,
      comments: {
        take: 1,
        orderBy: {
          created: "desc",
        },
        select: {
          updatedAt: true,
        },
      },
    },
    orderBy:
      sort === "latest"
        ? {
            createdAt: "desc",
          }
        : {
            likes: {
              _count: "desc",
            },
          },
  });

  return posts;
});

export default getPosts;
