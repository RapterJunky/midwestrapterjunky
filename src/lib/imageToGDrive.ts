import { createReadStream } from "node:fs";
import { unlink } from "node:fs/promises";
import { type File } from "formidable";
import { google } from "googleapis";
import { z } from "zod";

import { compileWebp } from "@lib/webp";
import { logger } from "@lib/logger";

const UPLOAD_FOLDER_ID = "1V8YE-FBAK3tYenL0CHwiMIOFbdEvEuf2";
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

export type ImageData = z.infer<typeof imageDataSchema>;

/**
 * @see https://www.labnol.org/google-api-service-account-220404
 * @see https://dev.to/temmietope/embedding-a-google-drive-image-in-html-3mm9
 */
export const uploadImages = async (
  images: ImageData[] | undefined,
  files: Record<`image[${string}]`, File>
) => {
  if (!images) return [];

  const creds = process.env.GOOGLE_SERVICE_KEY;

  const auth = new google.auth.GoogleAuth({
    projectId: creds.project_id,
    credentials: {
      type: creds.type,
      private_key: creds.private_key,
      client_email: creds.client_email,
      client_id: creds.client_id,
    },
    scopes: ["https://www.googleapis.com/auth/drive"],
  });

  const driveService = google.drive({ version: "v3", auth });

  const fileLinks = await Promise.allSettled(
    Object.entries(files).map(async ([key, value]) => {
      const uuid = key.replace("image[", "").replace("]", "");

      logger.info(
        {
          filename: value.originalFilename,
          mimetype: value.mimetype,
          uuid,
          size: value.size,
        },
        "Uploading image to Google Drive"
      );

      let filename = value.newFilename;
      let filepath = value.filepath;
      let mimetype = value.mimetype ?? undefined;
      if (mimetype && mimetype !== "image/webp") {
        const data = await compileWebp(filepath);

        filename = data.filename;
        filepath = data.filepath;
        mimetype = "image/webp";
      }

      const file = await driveService.files.create({
        requestBody: {
          name: filename,
          parents: [UPLOAD_FOLDER_ID],
        },
        media: {
          mimeType: mimetype,
          body: createReadStream(filepath),
        },
        fields: "id",
      });

      await driveService.permissions.create({
        fileId: file.data.id ?? undefined,
        requestBody: {
          role: "reader",
          type: "anyone",
        },
      });

      await unlink(filepath);

      return {
        recordId: uuid,
        id: file.data.id,
        src: `https://drive.google.com/uc?export=view&id=${file.data.id}`,
      };
    })
  );

  const links = fileLinks
    .map((link) => {
      if (link.status === "rejected") {
        logger.error(link.reason, "Image upload failed");
        return null;
      }
      return link.value;
    })
    .filter(Boolean);

  return images.map((value) => {
    const data = links.find((item) => item.recordId === value.id) ?? {
      recordId: value.id,
      id: "",
      src: "https://api.dicebear.com/6.x/initials/png?seed=%3F",
    };
    return {
      __typename: "ImageRecord",
      id: data.recordId,
      content: {
        imageId: data.id,
        blurUpThumb: "",
        responsiveImage: {
          src: data.src,
          alt: "Uploaded Image",
          height: value.height,
          width: value.width,
        },
      },
    };
  });
};
