import createHttpError from "http-errors";
import type { NextApiRequest, NextApiResponse } from "next";
import type { Session } from "next-auth";

const GET = async (req: NextApiRequest, res: NextApiResponse, session: Session, type: "post" | "comment") => {
    throw createHttpError.NotImplemented();
}

export default GET;