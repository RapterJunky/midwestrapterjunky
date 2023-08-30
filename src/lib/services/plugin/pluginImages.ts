import type { NextApiRequest, NextApiResponse } from "next";
import createHttpError from "http-errors";
import { rgbaToDataURL } from "thumbhash";
import sharp from "sharp";
import { z } from "zod";

import { GOOGLE_DRIVE_IMAGE_ROOT } from "@utils/googleConsts";
import googleDrive from "@api/googleDrive";

const schema = z.object({
  cursor: z.string().optional(),
  sort: z.enum(["user_upload", "cms_upload"]).optional(),
  type: z.enum(["list", "blurthumb"]).default("list"),
  q: z.string().optional(),
  id: z.string().or(z.array(z.string())).optional(),
});

const deleteSchema = z.object({
  id: z.string(),
});

const getBlur = async (imageId: string) => {
  const rawImage = await fetch(`${GOOGLE_DRIVE_IMAGE_ROOT}${imageId}`);
  const buffer = await rawImage.arrayBuffer();

  const raw = await sharp(buffer)
    .resize(16, 16)
    .blur(2)
    .raw()
    .ensureAlpha()
    .toBuffer({ resolveWithObject: true });
  const pngUrl = rgbaToDataURL(raw.info.width, raw.info.height, raw.data);
  const buf = Buffer.from(
    pngUrl.replace("data:image/png;base64,", ""),
    "base64",
  );
  const compress = await sharp(buf).toFormat("webp").toBuffer();

  return {
    id: imageId,
    blurthumb: `data:image/webp;base64,${compress.toString("base64")}`,
  };
};

const handleImage = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "GET": {
      const { q, cursor, type, sort, id } = schema.parse(req.query);

      const drive = googleDrive();

      if (type === "list") {
        const images = await drive.files.list({
          pageToken: cursor,
          pageSize: 50,
          fields:
            "nextPageToken, files(id, name,appProperties, imageMediaMetadata(width,height) )",
          q: `trashed = false and mimeType != \'application/vnd.google-apps.folder\' and visibility = 'anyoneWithLink'${
            sort
              ? ` and appProperties has { key='label' and value='${sort}' }`
              : ""
          }${q ? ` and fullText contains '${q}'` : ""}`,
        });

        return res.status(200).json({
          result: images.data.files,
          nextCursor: images.data.nextPageToken,
          hasNextPage: !!images.data.nextPageToken,
        });
      }

      if (!id) throw createHttpError.BadRequest("Missing image id");

      if (Array.isArray(id)) {
        const blurs = await Promise.all(id.map((value) => getBlur(value)));
        return res.status(200).json(blurs);
      }

      const blur = await getBlur(id);

      return res.status(200).json([blur]);
    }
    case "DELETE": {
      const { id } = deleteSchema.parse(req.query);

      const drive = googleDrive();

      if (id === "emptyTrash") {
        await drive.files.emptyTrash();
        return res.status(200).json({ status: "ok" });
      }

      await drive.files.delete({
        fileId: id,
        fields: "id",
      });

      return res.status(200).json({ status: "ok" });
    }
    default:
      throw createHttpError.MethodNotAllowed();
  }
};

export default handleImage;
