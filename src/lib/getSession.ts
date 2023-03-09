import type { NextApiRequest, NextApiResponse } from "next";
import { authConfig } from "@lib/config/auth";
import { getServerSession } from 'next-auth';
import { Unauthorized } from 'http-errors';

/**
 * 
 * @throws Unauthorized
 */
export const getSession = async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getServerSession(req, res, authConfig);
    if (!session) throw Unauthorized();
    return session;
}
