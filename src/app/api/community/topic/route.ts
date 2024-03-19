import createHttpError from "http-errors";
import { getServerSession } from "next-auth";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  deleteImages,
  extractImgTags,
  uploadFiles,
} from "@/lib/api/googleDrive";
import onError from "@/lib/api/handleError";
import prisma from "@/lib/api/prisma";
import ratelimit from "@/lib/api/rateLimit";
import { authConfig } from "@/lib/config/auth";

const schema = z.object({
  deletedId: z.array(z.string()).optional(),
  content: z.string(),
  category: z.coerce.number(),
  title: z.string().min(3).max(255),
  images: z.array(z.object({}).passthrough()).max(5).optional(),
  tag: z.array(z.string()).optional(),
  notification: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
  postId: z.string().uuid().optional(),
});

export async function PUT(request: NextRequest) {
  try {
    const limit = await ratelimit(request.ip);
    if (!limit.success) throw new createHttpError.TooManyRequests();

    const session = await getServerSession(authConfig);
    if (!session || session.user.banned !== 0)
      throw createHttpError.Unauthorized();

    const formData = await request.formData();

    const {
      deletedId,
      content,
      title,
      images,
      tag,
      notification,
      category,
      postId,
    } = schema.parse({
      deletedId: formData.getAll("deletedId"),
      content: formData.get("content"),
      title: formData.get("title"),
      category: formData.get("category"),
      images: formData.getAll("image"),
      tag: formData.getAll("tag"),
      notification: formData.get("notification"),
      postId: formData.get("postId"),
    });
    if (!postId) throw createHttpError.BadRequest("Missing postId");

    if (deletedId?.length) {
      await deleteImages(deletedId);
    }

    let fullContent = content;
    if (images?.length) {
      const newImages = await uploadFiles(
        formData.getAll("image") as never as File[],
      );

      for (const image of newImages) {
        fullContent = fullContent
          .replace(
            `data-blur-url="${image.replaceId}"`,
            image.blur.length ? `data-blur-url="${image.blur}"` : "",
          )
          .replace(`id="${image.replaceId}"`, `id="${image.id}"`)
          .replace(`src="${image.replaceId}"`, `src="${image.src}"`);
      }
    }

    const post = await prisma.threadPost.update({
      where: {
        id: postId,
      },
      data: {
        name: title,
        tags: tag,
        notifyOwner: notification,
        threadId: category,
        content: fullContent,
      },
      select: {
        id: true,
        updatedAt: true,
      },
    });

    revalidatePath(`/community/post/${post.id}`);

    return NextResponse.json(post);
  } catch (error) {
    return onError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const limit = await ratelimit(request.ip);
    if (!limit.success) throw new createHttpError.TooManyRequests();

    const session = await getServerSession(authConfig);
    if (!session || session.user.banned !== 0)
      throw createHttpError.Unauthorized();

    const formData = await request.formData();

    const { content, title, images, tag, category, notification } =
      schema.parse({
        content: formData.get("content"),
        category: formData.get("category"),
        title: formData.get("title"),
        images: formData.getAll("image"),
        tag: formData.getAll("tag"),
        notification: formData.get("notification"),
      });

    let fullContent = content;
    if (images?.length) {
      const newImages = await uploadFiles(
        formData.getAll("image") as never as File[],
      );

      for (const image of newImages) {
        fullContent = fullContent
          .replace(
            `data-blur-url="${image.replaceId}"`,
            image.blur.length ? `data-blur-url="${image.blur}"` : "",
          )
          .replace(`id="${image.replaceId}"`, `id="${image.id}"`)
          .replace(`src="${image.replaceId}"`, `src="${image.src}"`);
      }
    }

    const post = await prisma.threadPost.create({
      data: {
        content: fullContent,
        name: title,
        ownerId: session.user.id,
        tags: tag,
        threadId: category,
        notifyOwner: notification,
      },
      select: {
        id: true,
        createdAt: true,
      },
    });

    revalidateTag("community-categories");

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    return onError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const limit = await ratelimit(request.ip);
    if (!limit.success) throw new createHttpError.TooManyRequests();

    const session = await getServerSession(authConfig);
    if (!session) throw createHttpError.Unauthorized();
    const { searchParams } = new URL(request.url);

    const id = z.string().uuid().parse(searchParams.get("post"));

    const post = await prisma.threadPost.findUnique({
      where: {
        id,
        AND: {
          ownerId: session.user.id,
        },
      },
      select: {
        id: true,
        notifyOwner: true,
        threadId: true,
        name: true,
        tags: true,
        content: true,
      },
    });

    if (!post) throw createHttpError.NotFound("No post was found");

    return NextResponse.json({
      postId: post.id,
      category: post.threadId,
      content: post.content,
      tags: post.tags,
      notification: post.notifyOwner,
      title: post.name,
    });
  } catch (error) {
    return onError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const limit = await ratelimit(request.ip);
    if (!limit.success) throw new createHttpError.TooManyRequests();

    const session = await getServerSession(authConfig);
    if (!session) throw createHttpError.Unauthorized();

    const { searchParams } = new URL(request.url);
    const id = z.string().uuid().parse(searchParams.get("id"));

    const post = await prisma.threadPost.findUnique({
      where: {
        id,
        AND: {
          ownerId: session.user.id,
        },
      },
    });

    if (!post) throw createHttpError.NotFound("Failed to find post");

    const ids = extractImgTags(post.content);
    if (ids.length) await deleteImages(ids);

    const result = await prisma.threadPost.delete({
      where: {
        id: post.id,
      },
    });

    revalidateTag("community-categories");

    return NextResponse.json(result);
  } catch (error) {
    return onError(error);
  }
}
