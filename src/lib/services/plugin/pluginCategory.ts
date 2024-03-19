import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@api/prisma";

const schema = z.object({
  page: z.coerce.number().optional().default(1),
});

const createCategory = z.object({
  name: z.string().nonempty(),
  description: z.string().nonempty(),
  tags: z.array(z.string().min(3).max(15)).max(6),
  image: z.string().url(),
  allowUserPosts: z.boolean(),
});

const patchSchema = createCategory.extend({
  id: z.number().positive().min(1),
});

const revaildate = () => {
  revalidatePath("/community");
  revalidatePath("/community/topic");
};

async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { page } = schema.parse(Object.fromEntries(searchParams.entries()));

  const [categires, meta] = await prisma.thread.paginate().withPages({
    limit: 15,
    includePageCount: true,
    page,
  });

  return NextResponse.json({ ...meta, result: categires });
}

async function POST(request: Request) {
  const body = await request.json();

  const { tags, name, description, image, allowUserPosts } =
    createCategory.parse(body);

  const data = await prisma.thread.create({
    data: {
      description,
      allowUserPosts,
      image,
      tags,
      name,
    },
  });

  revaildate();

  return NextResponse.json(data, { status: 201 });
}

async function PATCH(request: Request) {
  const body = await request.json();

  const { id, tags, name, description, image, allowUserPosts } =
    patchSchema.parse(body);

  const data = await prisma.thread.update({
    where: {
      id,
    },
    data: {
      tags,
      allowUserPosts,
      name,
      description,
      image,
    },
  });

  revaildate();

  return NextResponse.json(data);
}

async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);

  const { id } = z
    .object({ id: z.coerce.number().positive().min(1) })
    .parse(Object.fromEntries(searchParams.entries()));

  const data = await prisma.thread.delete({
    where: {
      id,
    },
  });

  revaildate();

  return NextResponse.json(data);
}

const handlers = {
  GET,
  POST,
  DELETE,
  PATCH,
};

export default handlers;
