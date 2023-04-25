import type { NonTextNode } from "datocms-structured-text-slate-utils";
import type { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm, type File } from "formidable";
import { unlink } from "node:fs/promises";
import createHttpError from "http-errors";
import type { Session } from "next-auth";
import { z } from "zod";

import { imageDataSchema, uploadImages } from "@lib/imageToGDrive";
import { slateToDast } from "@/lib/utils/editor/slateToDast";
import prisma from "@api/prisma";

const MAX_IMAGES = 5;

const tagsSchema = z.array(z.string().min(3).max(15)).max(6);

const rootSchema = z.object({
  message: z
    .string()
    .transform((str, ctx) => {
      try {
        return JSON.parse(str);
      } catch (error) {
        ctx.addIssue({ code: "custom", message: "Invaild JSON" });
        return z.NEVER;
      }
    })
    .pipe(z.array(z.object({ type: z.string() }).passthrough()).min(1)),
  imageData: z
    .array(imageDataSchema)
    .or(imageDataSchema.transform((val) => [val]))
    .optional(),
});

const createPostSchema = rootSchema.extend({
  thread: z.coerce.number().positive().min(1),
  title: z.string().nonempty(),
  tags: tagsSchema.or(
    z
      .string()
      .transform((val) => [val])
      .pipe(tagsSchema)
  ),
});

const createCommentSchema = rootSchema.extend({
  parentId: z.string().uuid().optional(),
  postId: z.string().uuid(),
});

type CreatePostSchema = z.infer<typeof createPostSchema>;
type CreateCommentSchema = z.infer<typeof createCommentSchema>;

const parseForm = <T extends z.AnyZodObject>(
  req: NextApiRequest,
  schema: T
): Promise<{ fields: z.infer<T>; files: Record<`image[${string}]`, File> }> => {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({
      keepExtensions: true,
      allowEmptyFiles: false,
      multiples: true,
      maxFiles: MAX_IMAGES,
      filter({ mimetype }) {
        return !!(mimetype && mimetype.includes("image"));
      },
    });

    form.on("field", (field, value) => {
      const hasKey = schema.keyof().safeParse(field.replace("[]", ""));
      if (!hasKey.success) throw hasKey.error;

      const keyObject = (schema.shape as Record<string, z.AnyZodObject>)[
        hasKey.data as string
      ];
      if (!keyObject) throw new Error("Failed to find key");

      const result = keyObject.safeParse(value);
      if (!result.success) throw result.error;
    });
    form.parse(req, async (err, fields, files) => {
      if (err) {
        // remove images here
        for (const file of Object.values(files)) {
          await unlink((file as File).filepath);
        }
        return reject(err);
      }

      const data = schema.safeParse(fields);

      if (!data.success) {
        return reject(data.error);
      }

      resolve({
        fields: data.data,
        files: files as Record<`image[${string}]`, File>,
      });
    });
  });
};

const POST = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session,
  type: "post" | "comment"
) => {
  const schema = type === "comment" ? createCommentSchema : createPostSchema;
  const formData = await parseForm(req, schema);

  // check dast before having to handle image uploading.
  const dast = slateToDast(formData.fields.message as NonTextNode[]);
  if (!dast) throw createHttpError.BadRequest("Failed to vaildate dast");

  const imageBlocks = await uploadImages(
    formData.fields.imageData,
    formData.files
  );

  const document: PrismaJson.Dast = {
    blocks: imageBlocks,
    value: dast,
  };

  switch (type) {
    case "comment": {
      const comment = await prisma.comment.create({
        data: {
          ownerId: session.user.id,
          content: document,
          parentCommentId: (formData.fields as CreateCommentSchema).parentId,
          threadPostId: (formData.fields as CreateCommentSchema).postId,
        },
        select: {
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

      return res.status(201).json({
        ...comment,
        likedByMe: false,
        likeCount: 0,
      });
    }
    case "post": {
      const topic = await prisma.threadPost.create({
        data: {
          ownerId: session.user.id,
          content: document,
          name: (formData.fields as CreatePostSchema).title,
          tags: (formData.fields as CreatePostSchema).tags,
          threadId: (formData.fields as CreatePostSchema).thread,
        },
      });

      return res.status(201).json({ postId: topic.id });
    }
  }
};

export default POST;
