import { getServerSession } from "next-auth";
import { type NextRequest, NextResponse } from "next/server";
import createHttpError from "http-errors";
import { z } from "zod";

import {
  deleteImages,
  extractImgTags,
  uploadFiles,
} from "@/lib/api/googleDrive";
import { authConfig } from "@/lib/config/auth";
import onError from "@/lib/api/handleError";
import prisma from "@/lib/api/prisma";
import { logger } from "@/lib/logger";
import sendMail from "@/lib/api/sendMail";
import ratelimit from "@/lib/api/rateLimit";

const schema = z.object({
  content: z.string(),
  deletedId: z.array(z.string()).optional(),
  images: z.array(z.object({}).passthrough()).max(5).optional(),
  id: z.string().uuid(),
});

export async function DELETE(request: NextRequest) {
  try {
    const limit = await ratelimit(request.ip);
    if (!limit.success) throw new createHttpError.TooManyRequests();
    const session = await getServerSession(authConfig);
    if (!session) throw createHttpError.Unauthorized();

    const { searchParams } = new URL(request.url);

    const id = z.string().uuid().parse(searchParams.get("id"));

    const data = await prisma.comment.findFirst({
      where: {
        id,
        AND: {
          ownerId: session.user.id,
        },
      },
      select: {
        parentCommentId: true,
        content: true,
        id: true,
      },
    });

    if (!data)
      throw createHttpError.NotFound("No comment with given owner exists.");

    if (!data.parentCommentId) {
      await prisma.comment.deleteMany({
        where: {
          parentCommentId: data.id,
        },
      });
    }

    await prisma.comment.delete({
      where: {
        id: data.id,
      },
    });

    const ids = extractImgTags(data.content);

    if (ids.length) await deleteImages(ids);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return onError(error);
  }
}

const EMAIL_TEMPLTE_ID = "d-09d6805d0013445eb03fa020c5fabb7c";
export async function POST(request: NextRequest) {
  try {
    const limit = await ratelimit(request.ip);
    if (!limit.success) throw new createHttpError.TooManyRequests();

    const session = await getServerSession(authConfig);
    if (!session || session.user.banned !== 0)
      throw createHttpError.Unauthorized();

    const data = await request.formData();

    const { id, content, images } = schema.parse({
      content: data.get("content"),
      id: data.get("id"),
      deletedId: data.getAll("deletedId"),
      images: data.getAll("images"),
    });

    let fullContent = content;
    if (images?.length) {
      const newImages = await uploadFiles(
        data.getAll("image") as never as File[],
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

    const comment = await prisma.comment.create({
      data: {
        ownerId: session.user.id,
        threadPostId: id,
        content: fullContent,
      },
      select: {
        threadPost: {
          select: {
            notifyOwner: true,
            id: true,
            name: true,
            owner: {
              select: {
                email: true,
              },
            },
          },
        },
        id: true,
        content: true,
        created: true,
        parentCommentId: true,
        owner: {
          select: {
            image: true,
            id: true,
            name: true,
          },
        },
      },
    });

    if (comment.threadPost.notifyOwner) {
      logger.info("Sending notification");
      if (comment.threadPost.owner.email)
        await sendMail(
          {
            to: comment.threadPost.owner.email,
            templete: {
              id: EMAIL_TEMPLTE_ID,
              data: {
                topic_title: comment.threadPost.name,
                topic_link: `http${process.env.VERCEL_ENV !== "development" ? "s" : ""
                  }://${process.env.VERCEL_URL}/community/post/${comment.threadPost.id
                  }`,
              },
            },
          },
          comment.threadPost.id,
        );
    }

    delete (comment as Partial<typeof comment>).threadPost;

    return NextResponse.json(
      {
        ...comment,
        likedByMe: false,
        likeCount: 0,
      },
      { status: 201 },
    );
  } catch (error) {
    return onError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const limit = await ratelimit(request.ip);
    if (!limit.success) throw new createHttpError.TooManyRequests();

    const session = await getServerSession(authConfig);
    if (!session || session.user.banned !== 0)
      throw createHttpError.Unauthorized();

    const data = await request.formData();

    const { deletedId, content, images, id } = schema.parse({
      content: data.get("content"),
      deletedId: data.getAll("deletedId"),
      images: data.getAll("images"),
      id: data.get("id"),
    });

    if (deletedId?.length) {
      await deleteImages(deletedId);
    }

    let fullContent = content;
    if (images?.length) {
      const newImages = await uploadFiles(
        data.getAll("image") as never as File[],
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

    const comment = await prisma.comment.update({
      where: {
        id,
        AND: {
          ownerId: session.user.id,
        },
      },
      data: {
        content: fullContent,
      },
      select: {
        id: true,
        content: true,
        created: true,
        parentCommentId: true,
        _count: {
          select: {
            likes: true,
            // children: !parent
          },
        },
        owner: {
          select: {
            image: true,
            id: true,
            name: true,
          },
        },
      },
    });

    const likes = session
      ? await prisma.like.findMany({
        where: {
          userId: session.user.id,
          commentId: { in: [comment.id] },
        },
      })
      : [];

    const { _count, ...commentFields } = comment;

    return NextResponse.json({
      ...commentFields,
      likedByMe: !!likes.find((like) => like.commentId === comment.id),
      likeCount: _count.likes,
    });
  } catch (error) {
    return onError(error);
  }
}
