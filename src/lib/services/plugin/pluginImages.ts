import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import googleDrive from "@api/googleDrive";
import createHttpError from "http-errors";

const schema = z.object({
    cursor: z.string().optional(),
    q: z.string().optional()
});

const handleImage = async (req: NextApiRequest, res: NextApiResponse) => {
    switch (req.method) {
        case "GET": {
            const { q, cursor } = schema.parse(req.query);

            const drive = googleDrive();

            const images = await drive.files.list({
                pageToken: cursor,
                pageSize: 50,
                fields: "nextPageToken, files(id, name,appProperties)",
                q: `trashed = false and mimeType != \'application/vnd.google-apps.folder\' and visibility = \'anyoneWithLink\'`,
            });

            return res.status(200).json({
                result: images.data.files,
                nextCursor: images.data.nextPageToken,
                hasNextPage: !!images.data.nextPageToken
            });
        }
        default:
            throw createHttpError.MethodNotAllowed();
    }
}

export default handleImage;