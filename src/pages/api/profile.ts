import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "@lib/getSession";
import { handleError } from "@api/errorHandler";
import prisma from "@api/prisma";
import createHttpError from "http-errors";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const session = await getSession(req, res, true);

    switch (req.method) {
      case "GET": {
        const account = await prisma.account.findFirst({
          where: {
            userId: session.user.id,
          },
          select: {
            provider: true,
          },
        });

        if (!account)
          throw createHttpError.NotFound("Failed to find user account");

        return res.status(200).json({
          provider: account.provider,
        });
      }
      case "DELETE": {
        await prisma.user.delete({
          where: {
            id: session.user.id,
          },
        });
        return res.status(200).json({
          status: "ok",
          deleted: new Date(),
        });
      }
      default:
        throw new createHttpError.MethodNotAllowed();
    }
  } catch (error) {
    return handleError(error, res);
  }
};

export default handler;
