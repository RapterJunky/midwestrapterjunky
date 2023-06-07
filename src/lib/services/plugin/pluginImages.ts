import type { NextApiRequest, NextApiResponse } from "next";
import createHttpError from "http-errors";
import { rgbaToDataURL } from "thumbhash";
import sharp from "sharp";
import { z } from "zod";

import googleDrive from "@api/googleDrive";

const schema = z.object({
    cursor: z.string().optional(),
    sort: z.enum(["user_upload", "cms_upload"]).optional(),
    type: z.enum(["list", "blurthumb"]).default("list"),
    q: z.string().optional(),
    id: z.string().optional(),
});

const deleteSchema = z.object({
    id: z.string()
});

const handleImage = async (req: NextApiRequest, res: NextApiResponse) => {
    switch (req.method) {
        case "GET": {
            const { q, cursor, type, sort, id } = schema.parse(req.query);

            const drive = googleDrive();

            if (type === "list") {
                const images = await drive.files.list({
                    pageToken: cursor,
                    pageSize: 50,
                    fields: "nextPageToken, files(id, name,appProperties, imageMediaMetadata(width,height) )",
                    q: `trashed = false and mimeType != \'application/vnd.google-apps.folder\' and visibility = 'anyoneWithLink'${sort ? ` appProperties has { label='${sort}' }` : ""}${q ? ` and fullText contains '${q}'` : ""}`,
                });

                return res.status(200).json({
                    result: images.data.files,
                    nextCursor: images.data.nextPageToken,
                    hasNextPage: !!images.data.nextPageToken
                });
            }

            if (!id) throw createHttpError.BadRequest("Missing image id");

            const rawImage = await fetch(`https://drive.google.com/uc?id=${id}`);

            const raw = await sharp(await rawImage.arrayBuffer()).resize(16, 16).blur(2).raw().ensureAlpha().toBuffer({ resolveWithObject: true });
            const pngUrl = rgbaToDataURL(
                raw.info.width,
                raw.info.height,
                raw.data
            );
            const buf = Buffer.from(
                pngUrl.replace("data:image/png;base64,", ""),
                "base64"
            );
            const compress = await sharp(buf).toFormat("webp").toBuffer();

            const blur = `data:image/webp;base64,${compress.toString("base64")}`

            return res.status(200).send({
                blurthumb: blur
            });
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
                fields: "id"
            })

            return res.status(200).json({ status: "ok" });
        }
        default:
            throw createHttpError.MethodNotAllowed();
    }
}

export default handleImage;