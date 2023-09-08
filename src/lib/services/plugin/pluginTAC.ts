import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@api/prisma";

const schema = z.object({
  page: z.coerce.number().positive().min(1).optional().default(1),
  search: z
    .string()
    .transform((value) => decodeURIComponent(value))
    .optional(),
});

const schemaPatch = z.object({
  id: z.string().uuid(),
  type: z.literal("topic"),
  prop: z.enum(["locked", "pinned", "notifyOwner"]),
  value: z.boolean(),
});

async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { page, search } = schema.parse(
    Object.fromEntries(searchParams.entries()),
  );

  const [topics, meta] = await prisma.threadPost
    .paginate({
      select: {
        name: true,
        locked: true,
        pinned: true,
        id: true,
        tags: true,
        notifyOwner: true,
        thread: {
          select: {
            name: true,
          },
        },
        owner: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      where: {
        name: {
          contains: search,
        },
      },
    })
    .withPages({
      includePageCount: true,
      page,
      limit: 15,
    });

  return NextResponse.json({
    ...meta,
    result: topics,
  });
}

async function PATCH(request: Request) {
  const body = await request.json();

  const { id, prop, value } = schemaPatch.parse(body);

  const post = await prisma.threadPost.update({
    where: {
      id,
    },
    data: {
      [prop]: value,
    },
    select: {
      name: true,
      locked: true,
      pinned: true,
      id: true,
      tags: true,
      notifyOwner: true,
      thread: {
        select: {
          name: true,
        },
      },
      owner: {
        select: {
          name: true,
          image: true,
        },
      },
    },
  });

  return NextResponse.json(post);
}

const handlers = {
  GET,
  PATCH,
};

export default handlers;
