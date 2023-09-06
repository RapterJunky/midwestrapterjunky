import "server-only";
import { cache } from "react";
import prisma from "@/lib/api/prisma";

const getCategoryPosts = cache(async (categoryId: number, page: number) => {
  const [posts, meta] = await prisma.threadPost
    .paginate({
      where: {
        threadId: categoryId,
      },
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
      orderBy: {
        likes: {
          _count: "desc",
        },
      },
    })
    .withPages({
      includePageCount: true,
      limit: 15,
      page,
    });

  return { result: posts, ...meta };
});

export default getCategoryPosts;
