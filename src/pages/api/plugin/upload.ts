import type { NextApiRequest, NextApiResponse } from "next";
import { unlink, readFile } from "node:fs/promises";
import createHttpError from "http-errors";
import { tmpdir } from "node:os";
import { join } from "node:path";
import multer from "multer";

import { cwebp } from "@lib/webp";
import { logger } from "@lib/logger";
import { handleError } from "@api/errorHandler";

interface FileUpload {
  file: {
    fieldname: string;
    filename: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    destination: string;
    path: string;
    size: number;
  };
}

const tmp = tmpdir();

const upload = multer({
  storage: multer.diskStorage({
    destination: tmp,
    filename: (req, file, cb) => cb(null, file.originalname),
  }),
});

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};

export default async function handle(
  req: NextApiRequest & FileUpload,
  res: NextApiResponse
) {
  try {
    if (
      req.method !== "POST" ||
      !req.headers["content-type"]?.includes("multipart/form-data")
    )
      throw createHttpError.BadRequest();
    if (
      !req.headers.authorization ||
      req.headers.authorization.replace("Bearer ", "") !==
        process.env.PLUGIN_TOKEN
    )
      throw createHttpError.Unauthorized();

    await new Promise<void>((ok, rej) => {
      upload.single("image")(req, res, (err) => {
        if (err) return rej(err);
        return ok();
      });
    });

    logger.info(req.file, `${req.file.mimetype} | ${req.file.originalname}`);

    let filename = req.file.filename;
    let filepath = req.file.path;

    if (req.file.mimetype !== "image/webp") {
      filename = filename.replace(/(\..+)$/g, ".webp");
      filepath = join(tmp, filename);
      await cwebp(req.file.path, filepath);
      await unlink(req.file.path);
    }

    const file = await readFile(filepath, { encoding: "base64" });

    await unlink(filepath);

    return res.status(200).json({
      base64: `data:image/webp;base64,${file}`,
      filename: filename,
    });
  } catch (error) {
    handleError(error, res);
  }
}
