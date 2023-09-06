import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@api/prisma";

const schema = z.object({
  page: z.coerce.number().min(0).optional().default(1),
  limit: z.coerce.number().gte(10).lte(50).optional().default(50),
});

async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { page, limit } = schema.parse(
    Object.fromEntries(searchParams.entries()),
  );

  const [user, meta] = await prisma.user
    .paginate({
      select: {
        email: true,
        name: true,
        id: true,
        banned: true,
      },
    })
    .withPages({
      includePageCount: true,
      page: page + 1,
      limit,
    });

  return NextResponse.json({
    ...meta,
    result: user,
  });
}

async function PATCH(request: Request) {
  const body = await request.json();

  const { id, ban } = z
    .object({ id: z.string().cuid(), ban: z.number().min(0).max(2) })
    .parse(body);

  const data = await prisma.user.update({
    where: {
      id,
    },
    data: {
      banned: ban,
    },
  });

  return NextResponse.json({
    email: data.email,
    name: data.name,
    id: data.id,
    banned: data.banned,
  });
}

async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const { id } = z
    .object({ id: z.string().cuid() })
    .parse(Object.fromEntries(searchParams.entries()));

  await prisma.user.delete({
    where: {
      id,
    },
  });

  return NextResponse.json({ ok: true, now: new Date().getTime() });
}

const handlers = {
  GET,
  PATCH,
  DELETE,
};

export default handlers;
