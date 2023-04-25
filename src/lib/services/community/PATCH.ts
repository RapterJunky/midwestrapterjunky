import type { NextApiRequest, NextApiResponse } from "next";
import createHttpError from "http-errors";
import type { Session } from "next-auth";

/**
 * Handle updating post/comments with new slate content.
 * handle uploading new image and ignoring old images
 */
const PATCH = (
  _req: NextApiRequest,
  _res: NextApiResponse,
  _session: Session,
  _type: "post" | "comment"
) => {
  throw createHttpError.NotImplemented();
};

export default PATCH;
