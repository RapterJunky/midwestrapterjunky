import "server-only";
import { cache } from "react";
import prisma from "@/lib/api/prisma";

type SuggestedProps = {
  tags: string[];
  ignore: string;
};

const _internalFetch = cache(async (data: string) => {
  const { tags, ignore } = JSON.parse(data) as SuggestedProps;

  const posts = await prisma.threadPost.findMany({
    where: {
      NOT: ignore
        ? {
            id: ignore,
          }
        : undefined,
      tags: {
        array_contains: tags,
      },
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
    take: 5,
  });

  return posts;
});

const getSuggested = (props: SuggestedProps) =>
  _internalFetch(JSON.stringify(props));

export default getSuggested;
