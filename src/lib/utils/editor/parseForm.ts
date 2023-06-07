import type { Record as DastReacord } from "datocms-structured-text-utils";
import { PassThrough, type Writable, pipeline } from "node:stream";
import { IncomingForm, type File } from "formidable";
import type { NextApiRequest } from "next";
import { rgbaToDataURL } from "thumbhash";
import createHttpError from "http-errors";
import sharp from "sharp";
import { z } from "zod";

import googleDrive, { driveConfig, imageConfig } from "@api/googleDrive";
import { logger } from "@lib/logger";

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


const handleDeleteImages = async (data: string[], service: ReturnType<typeof googleDrive>["files"]) => {
  const results = await Promise.allSettled(data.map(imageId => service.delete({
    fileId: imageId
  })));
  for (const result of results) {
    if (result.status === "rejected") logger.error(result.reason, "Failed to delete image.");
  }

  await service.emptyTrash();
}

/**
 * @see https://www.labnol.org/google-api-service-account-220404
 * @see https://dev.to/temmietope/embedding-a-google-drive-image-in-html-3mm9
 * @see https://blog.appsignal.com/2022/02/02/use-streams-to-build-high-performing-nodejs-applications.html
 * @see https://dev.to/bryce/generate-thumbhash-at-edge-for-tiny-progressive-images-282h
 * @see https://github.com/node-formidable/formidable/blob/master/examples/store-files-on-s3.js
 * @see https://daily-dev-tips.com/posts/host-images-via-google-drive/
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
    const uploadImageIds: string[] = [];

    const form = new IncomingForm({
      keepExtensions: false,
      allowEmptyFiles: false,
      multiples: true,
      fileWriteStreamHandler: ((file: File) => {
        const pass = new PassThrough();
        const webpConvent = sharp().withMetadata().toFormat("webp").webp();

        const blur = pipeline(
          pass,
          sharp().resize(imageConfig.size, imageConfig.size).blur(imageConfig.blur).raw().ensureAlpha(),
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
              parents: [driveConfig.uploadFolderId],
              appProperties: {
                blurthumb: "",
                alt: "",
                sizes: "((min-width: 10em) and (max-width: 20em)) 10em, ((min-width: 30em) and (max-width: 40em)) 30em, (min-width: 40em) 40em",
                label: "user_upload"
              },
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
            if (res.data.id) uploadImageIds.push(res.data.id);
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
          })
        uploads.push(fileUpload);

        return pass as Writable;
      }) as () => Writable,
      maxFileSize: imageConfig.maxSize,
      maxFiles: 5,
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
      if (err) return reject(err);

      const data = schema.safeParse(fields);
      if (!data.success) return reject(data.error);

      const rawUploadData = await Promise.allSettled(uploads);
      const rawUploadBlurData = await Promise.allSettled(uploadBlurs);

      const uploadData: {
        imageId?: string | undefined;
        file: string;
      }[] = [];
      for (const check of rawUploadData) {
        if (check.status === "rejected") {
          logger.error(check, "Image upload failed.");
          // try deleteing images
          await handleDeleteImages(uploadImageIds, driveService.files);
          return reject("Image upload failed");
        }
        uploadData.push(check.value);
      }

      const uploadBlurData: { file: string; blur: string; }[] = [];
      for (const check of rawUploadBlurData) {
        if (check.status === "rejected") {
          // we can live without a image blur
          logger.error(check, "Failed to generate image blur");
          break;
        }
        uploadBlurData.push(check.value);
      }

      if (req.method === "PATCH" && data.data.deletedImages) await handleDeleteImages(data.data.deletedImages as string[], driveService.files);

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

        if (!imageData || !googleData)
          return {
            __typename: "ImageRecord",
            id: uuid,
            content: {
              imageId: "",
              blurUpThumb: blurData?.blur ?? "",
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
            blurUpThumb: blurData?.blur ?? "",
            responsiveImage: {
              src: `https://drive.google.com/uc?id=${googleData.imageId}`,
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
