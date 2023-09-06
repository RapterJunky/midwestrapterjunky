import { NextResponse } from "next/server";
import createHttpError from "http-errors";
import { z } from "zod";

import prisma from "@api/prisma";

const getSchema = z.object({
  search: z.string().optional(),
  type: z.enum(["Comment", "Post"]).optional(),
  order: z.enum(["asc", "desc"]).optional().default("asc"),
  page: z.coerce.number().positive().min(1).optional().default(1),
});

const deleteSchema = z.object({
  id: z.coerce.number().positive().or(z.string().uuid()),
  type: z.enum(["comment", "report", "topic"]),
});

async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { search, order, page, type } = getSchema.parse(
    Object.fromEntries(searchParams),
  );

  const [reports, meta] = await prisma.report
    .paginate({
      where: {
        reason: {
          contains: search,
        },
        type,
      },
      include: {
        comment: {
          include: {
            owner: true,
          },
        },
        owner: true,
        post: {
          include: {
            owner: true,
          },
        },
      },
      orderBy: {
        created: order,
      },
    })
    .withPages({ page, limit: 20, includePageCount: true });

  return NextResponse.json({ ...meta, result: reports });
}

async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const { id, type } = deleteSchema.parse(Object.fromEntries(searchParams));
  switch (type) {
    case "comment": {
      if (typeof id !== "string") throw createHttpError.BadRequest("Bad Id");
      await prisma.$transaction([
        prisma.comment.deleteMany({
          where: {
            parentCommentId: id,
          },
        }),
        prisma.comment.delete({ where: { id } }),
      ]);
      return NextResponse.json({ message: "ok" });
    }
    case "report": {
      if (typeof id !== "number") throw createHttpError.BadRequest("Bad Id");
      await prisma.report.delete({ where: { id } });
      return NextResponse.json({ message: "ok" });
    }
    case "topic": {
      if (typeof id !== "string") throw createHttpError.BadRequest("Bad Id");
      await prisma.threadPost.delete({ where: { id } });
      return NextResponse.json({ message: "ok" });
    }
  }
}

const handlers = {
  GET,
  DELETE,
};

export default handlers;
