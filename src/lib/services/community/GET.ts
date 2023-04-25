import type { NextApiRequest, NextApiResponse } from "next";
import createHttpError from "http-errors";
import type { Session } from "next-auth";

/**
 * Return editable slate struct for editing post/comments
 */
const GET = (
  _req: NextApiRequest,
  _res: NextApiResponse,
  _session: Session,
  _type: "post" | "comment"
) => {
  throw createHttpError.NotImplemented();
};

export default GET;
