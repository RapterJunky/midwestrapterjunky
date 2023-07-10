import { PassThrough, type Writable, pipeline } from "node:stream";
import type { NextApiRequest, NextApiResponse } from "next";
import { type File, IncomingForm } from "formidable";
import { rgbaToDataURL } from "thumbhash";
import createHttpError from "http-errors";
import { parse } from "node:path";
import sharp from "sharp";

import googleDrive, { driveConfig, imageConfig } from "@api/googleDrive";
import { handleError } from "@api/errorHandler";
import type { GoogleImage } from "@type/google";
import { logger } from "@lib/logger";

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};
export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    if (
      req.method !== "POST" ||
      !req.headers["content-type"]?.startsWith("multipart/form-data")
    )
      throw createHttpError.BadRequest();
    if (
      !req.headers.authorization ||
      req.headers.authorization.replace("Bearer ", "") !==
        process.env.PLUGIN_TOKEN
    )
      throw createHttpError.Unauthorized();

    const driveService = googleDrive();

    let blur: Promise<string>;
    let imageId: Promise<object>;

    const form = new IncomingForm({
      maxFiles: 1,
      multiples: false,
      allowEmptyFiles: false,
      // 5MB
      maxFileSize: imageConfig.maxSize,
      keepExtensions: false,
      fileWriteStreamHandler: ((file: File) => {
        const pass = new PassThrough();
        const webpConvent = sharp().withMetadata().toFormat("webp").webp();
        blur = pipeline(
          pass,
          sharp().resize(16, 16).blur(2).raw().ensureAlpha(),
          (err) => {
            if (err) logger.error(err);
          },
        )
          .toBuffer({ resolveWithObject: true })
          .then(async (value) => {
            logger.debug(value.info);

            const pngUrl = rgbaToDataURL(
              value.info.width,
              value.info.height,
              value.data,
            );
            const buf = Buffer.from(
              pngUrl.replace("data:image/png;base64,", ""),
              "base64",
            );
            const compress = await sharp(buf).toFormat("webp").toBuffer();

            return `data:image/webp;base64,${compress.toString("base64")}`;
          });

        imageId = driveService.files
          .create({
            requestBody: {
              name: `${
                parse(file.originalFilename ?? file.newFilename).name
              }.webp`,
              parents: [driveConfig.uploadFolderId],
              originalFilename: file.originalFilename,
              appProperties: {
                blurthumb: "",
                alt: file.newFilename,
                sizes: "",
                label: "cms_upload",
              },
            },
            media: {
              mimeType: "image/webp",
              body: pipeline(pass, webpConvent, (err) => {
                if (err) logger.error(err);
              }),
            },
            fields: "name,id,appProperties,imageMediaMetadata(width,height)",
          })
          .then(async (res) => {
            await driveService.permissions.create({
              fileId: res.data.id ?? undefined,
              requestBody: {
                role: "reader",
                type: "anyone",
              },
            });
            return res.data;
          });

        return pass as Writable;
      }) as () => Writable,
      filter({ mimetype }) {
        return !!(mimetype && mimetype.includes("image"));
      },
    });

    const file = await new Promise<GoogleImage>((ok, reject) => {
      form.parse(req, async (err, _fields, _files) => {
        if (err) {
          return reject(err);
        }
        const [blurthumb, imageData] = await Promise.all([blur, imageId]);

        ok({
          ...(imageData as GoogleImage),
          appProperties: {
            ...(imageData as GoogleImage).appProperties,
            blurthumb,
          },
        } as GoogleImage);
      });
    });

    return res.status(200).json(file);
  } catch (error) {
    handleError(error, res);
  }
}
