import { type Session, getServerSession as getPagesSession } from "next-auth";
import { getServerSession as getAppdirSession } from "next-auth/next";
import type { NextApiResponse, NextApiRequest } from "next";
import { Unauthorized } from "http-errors";
import "server-only";

import { authConfig } from "@lib/config/auth";

type Options<T extends boolean> = {
    throwOnNull?: T;
    ctx?: {
        req: NextApiRequest,
        res: NextApiResponse
    }
}
async function getAuthSession(opts: Options<true>): Promise<Session>;
async function getAuthSession(opts: Options<false>): Promise<Session | null>;
async function getAuthSession({ throwOnNull = false, ctx }: Options<boolean>): Promise<Session | null> {
    const session = !ctx ? await getAppdirSession(authConfig) : await getPagesSession(ctx.req, ctx.res, authConfig);

    if (!session && throwOnNull) throw Unauthorized();

    return session;
}

export default getAuthSession;