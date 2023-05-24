import { IncomingForm, type File } from "formidable";
import sharp from "sharp";
import type { NextApiRequest } from "next";
import { z } from "zod";
import { rgbaToDataURL } from "thumbhash";
import type { Record as DastReacord } from "datocms-structured-text-utils";
import createHttpError from "http-errors";
import { PassThrough, type Writable, pipeline } from "node:stream";
import { logger } from "@/lib/logger";
import googleDrive from "@api/googleDrive";

const MAX_IMAGES = 5;

const tagsSchema = z.array(z.string().min(3).max(15)).max(6);

export const imageDataSchema = z
  .string()
  .transform((str, ctx) => {
    try {
      return JSON.parse(str);
    } catch (error) {
      ctx.addIssue({ code: "custom", message: "Invaild JSON" });
      return z.NEVER;
    }
  })
  .pipe(
    z.object({ id: z.string().uuid(), width: z.number(), height: z.number() })
  );

const rootSchema = z.object({
  editId: z.string().uuid().optional(),
  deletedImages: z
    .array(z.string())
    .or(z.string().transform((value) => [value]))
    .optional(),
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

export const topicSchema = rootSchema.extend({
  thread: z.coerce.number().positive().min(1),
  title: z.string().nonempty(),
  notification: z
    .enum(["true", "false"])
    .transform((value) => value === "true"),
  tags: tagsSchema
    .or(
      z
        .string()
        .transform((val) => [val])
        .pipe(tagsSchema)
    )
    .optional()
    .default([]),
});

export const commentSchema = rootSchema.extend({
  parentId: z.string().uuid().optional(),
  postId: z.string().uuid(),
});

export type ImageData = z.infer<typeof imageDataSchema>;
export type TopicSchema = z.infer<typeof topicSchema>;
export type CommentSchema = z.infer<typeof commentSchema>;

const UPLOAD_FOLDER_ID = "1V8YE-FBAK3tYenL0CHwiMIOFbdEvEuf2";

/**
 * @see https://www.labnol.org/google-api-service-account-220404
 * @see https://dev.to/temmietope/embedding-a-google-drive-image-in-html-3mm9
 * @see https://blog.appsignal.com/2022/02/02/use-streams-to-build-high-performing-nodejs-applications.html
 * @see https://dev.to/bryce/generate-thumbhash-at-edge-for-tiny-progressive-images-282h
 * @see https://github.com/node-formidable/formidable/blob/master/examples/store-files-on-s3.js
 */
const parseForm = <T extends z.AnyZodObject>(
  req: NextApiRequest,
  method: "POST" | "PATCH",
  schema: T
): Promise<{
  fields: z.infer<T>;
  files: Record<`image[${string}]`, File>;
  imagesBlocks: DastReacord[];
}> => {
  const driveService = googleDrive();

  return new Promise((resolve, reject) => {
    const uploads: Promise<{ imageId?: string; file: string }>[] = [];
    const uploadBlurs: Promise<{ blur: string; file: string }>[] = [];

    const form = new IncomingForm({
      keepExtensions: false,
      allowEmptyFiles: false,
      multiples: true,
      fileWriteStreamHandler: ((file: File) => {
        const pass = new PassThrough();
        const webpConvent = sharp().withMetadata().toFormat("webp").webp();

        const blur = pipeline(
          pass,
          sharp().resize(16, 16).blur(2).raw().ensureAlpha(),
          (err) => {
            if (err) logger.error(err);
          }
        )
          .toBuffer({ resolveWithObject: true })
          .then(async (value) => {
            logger.debug(value.info);

            const pngUrl = rgbaToDataURL(
              value.info.width,
              value.info.height,
              value.data
            );
            const buf = Buffer.from(
              pngUrl.replace("data:image/png;base64,", ""),
              "base64"
            );
            const compress = await sharp(buf).toFormat("webp").toBuffer();

            return {
              blur: `data:image/webp;base64,${compress.toString("base64")}`,
              file: file.newFilename,
            };
          });
        uploadBlurs.push(blur);

        const fileUpload = driveService.files
          .create({
            requestBody: {
              name: `${file.newFilename}.webp`,
              parents: [UPLOAD_FOLDER_ID],
            },
            media: {
              mimeType: "image/webp",
              body: pipeline(pass, webpConvent, (err) => {
                if (err) logger.error(err);
              }),
            },
            fields: "id",
          })
          .then(async (res) => {
            await driveService.permissions.create({
              fileId: res.data.id ?? undefined,
              requestBody: {
                role: "reader",
                type: "anyone",
              },
            });
            return {
              imageId: res.data.id ?? undefined,
              file: file.newFilename,
            };
          });
        uploads.push(fileUpload);

        return pass as Writable;
      }) as () => Writable,
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

      if (hasKey.data === "editId" && method === "PATCH" && !result.data)
        throw createHttpError.BadRequest("Missing editId from request.");
    });
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return reject(err);
      }

      const uploadData = await Promise.all(uploads);
      const uploadBlurData = await Promise.all(uploadBlurs);

      const data = schema.safeParse(fields);

      if (!data.success) {
        return reject(data.error);
      }

      if (req.method === "PATCH" && data.data.deletedImages) {
        const results = await Promise.allSettled(
          (data.data.deletedImages as string[]).map((value) =>
            driveService.files.delete({
              fileId: value,
            })
          )
        );

        for (const result of results) {
          if (result.status === "rejected") logger.error(result.reason);
        }
      }

      const imagesBlocks = Object.entries(
        files as Record<`image[${string}]`, File>
      ).map(([key, value]) => {
        const uuid = key.replace("image[", "").replace("]", "");

        //console.log(data.data.imageData, imageData);

        const imageData = (data.data.imageData as ImageData[]).find(
          (item) => item.id === uuid
        );
        const googleData = uploadData.find(
          (item) => item.file === value.newFilename
        );
        const blurData = uploadBlurData.find(
          (item) => item.file === value.newFilename
        );

        if (!blurData || !imageData || !googleData)
          return {
            __typename: "ImageRecord",
            id: uuid,
            content: {
              imageId: "",
              blurUpThumb: "",
              responsiveImage: {
                src: "https://api.dicebear.com/6.x/initials/png?seed=%3F",
                alt: "Failed Image Upload",
                height: 100,
                width: 100,
              },
            },
          };

        return {
          __typename: "ImageRecord",
          id: uuid,
          content: {
            imageId: googleData.imageId,
            blurUpThumb: blurData.blur,
            responsiveImage: {
              src: `https://drive.google.com/uc?export=view&id=${googleData.imageId}`,
              alt: "Uploaded Image",
              height: imageData.height,
              width: imageData.width,
            },
          },
        };
      });

      resolve({
        imagesBlocks,
        fields: data.data,
        files: files as Record<`image[${string}]`, File>,
      });
    });
  });
};

export default parseForm;
