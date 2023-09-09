import "server-only";
import { cache } from "react";
import prisma from "@/lib/api/prisma";

const getPost = cache(async (id: string) => {
  const post = await prisma.threadPost.findUnique({
    where: {
      id,
    },
    include: {
      _count: {
        select: {
          likes: true,
        },
      },
      owner: {
        select: {
          image: true,
          name: true,
        },
      },
    },
  });

  return post;
});

export default getPost;
