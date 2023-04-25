import type { NextApiRequest, NextApiResponse } from "next";
import { type Session, getServerSession } from "next-auth";
import { Unauthorized } from "http-errors";

import { authConfig } from "@lib/config/auth";

/**
 *
 * @throws Unauthorized
 */
export const getSession = async <T extends boolean = true>(
  req: NextApiRequest,
  res: NextApiResponse,
  error?: T
) => {
  const session = await getServerSession(req, res, authConfig);
  if (!session && !error) throw Unauthorized();
  return session as T extends true ? Session : Session | null;
};
