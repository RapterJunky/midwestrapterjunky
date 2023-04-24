import type { NextApiRequest, NextApiResponse } from "next";
import { unlink, readFile } from "node:fs/promises";
import createHttpError from "http-errors";
import { type File, IncomingForm } from "formidable";

import { compileWebp } from "@lib/webp";
import { logger } from "@lib/logger";
import { handleError } from "@api/errorHandler";

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
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

    const form = new IncomingForm({
      maxFiles: 1,
      multiples: false,
      allowEmptyFiles: false,
      keepExtensions: true,
      filter({ name, originalFilename, mimetype }) {
        return !!(mimetype && mimetype.includes("image"))
      }
    });


    const file = await new Promise<File>((ok, reject) => {
      form.parse(req, async (err, _fields, files) => {
        if (err) {
          return reject(err);
        }

        ok(files["image"] as File);
      });
    })

    logger.info(file, `${file.mimetype} | ${file.originalFilename}`);

    let filename = file.newFilename;
    let filepath = file.filepath;

    if (file.mimetype !== "image/webp") {
      const data = await compileWebp(filepath);

      filepath = data.filepath;
      filename = data.filename;

    }

    const filebase64 = await readFile(filepath, { encoding: "base64" });

    await unlink(filepath);

    return res.status(200).json({
      base64: `data:image/webp;base64,${filebase64}`,
      filename: filename,
    });
  } catch (error) {
    handleError(error, res);
  }
}
