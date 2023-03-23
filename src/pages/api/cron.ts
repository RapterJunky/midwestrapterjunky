import type { NextApiRequest, NextApiResponse } from "next";

import { handleError } from "@api/errorHandler";
import { applyRateLimit } from "@api/rateLimiter";
import prisma from "@api/prisma";
import { logger } from "@lib/logger";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        await applyRateLimit(req, res);

        const expiredTokens = await prisma.verificationToken.deleteMany({
            where: {
                expires: {
                    lte: new Date()
                }
            }
        });

        logger.info(expiredTokens, "Removed Expired Tokens");

        return res.status(200).json(expiredTokens);
    } catch (error) {
        handleError(error, res);
    }
}