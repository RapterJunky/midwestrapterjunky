import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@api/prisma";

const authorSchema = z.object({
  avatar: z.string().url(),
  name: z.string(),
  social: z
    .object({
      link: z.string().url(),
      user: z.string(),
    })
    .nullable()
    .transform((value) => {
      if (!value) return Prisma.DbNull;
      return value;
    }),
  id: z.string().uuid(),
});

const querySchema = z.object({
  page: z.coerce.number().positive().min(1).optional().default(1),
});

async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { page } = querySchema.parse(
    Object.fromEntries(searchParams.entries()),
  );

  const [authors, meta] = await prisma.authors.paginate().withPages({
    page,
    limit: 10,
    includePageCount: true,
  });

  return NextResponse.json({ result: authors, ...meta }, { status: 200 });
}

async function POST(request: Request) {
  const body = await request.json();

  const data = authorSchema.parse(body);

  const result = await prisma.authors.create({
    data,
  });

  return NextResponse.json(result, { status: 201 });
}

async function PATCH(request: Request) {
  const body = await request.json();
  const data = authorSchema.parse(body);

  const result = await prisma.authors.update({
    data: data,
    where: {
      id: data.id,
    },
  });

  return NextResponse.json(result, { status: 202 });
}

async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = z
    .object({ id: z.string() })
    .parse(Object.fromEntries(searchParams.entries()));
  await prisma.authors.delete({
    where: {
      id: query.id,
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}

const handlers = {
  GET,
  DELETE,
  PATCH,
  POST,
};

export default handlers;
