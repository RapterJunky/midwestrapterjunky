import type { NextApiRequest, NextApiResponse } from "next";
import createHttpError from "http-errors";
import { Session } from "next-auth";
import { z } from "zod";

const PATCH = async (req: NextApiRequest, res: NextApiResponse, session: Session | null) => {
    throw createHttpError.NotImplemented();
}

export default PATCH;