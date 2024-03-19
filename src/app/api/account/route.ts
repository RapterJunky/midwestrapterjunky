import createHttpError from "http-errors";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/config/auth";
import onError from "@api/handleError";
import prisma from "@api/prisma";
import { logger } from "@lib/logger";

export const GET = async () => {
  try {
    const session = await getServerSession(authConfig);
    if (!session) throw createHttpError.Unauthorized();

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      include: {
        accounts: {
          select: {
            provider: true,
            type: true,
            providerAccountId: true,
          },
        },
      },
    });

    if (!user) throw createHttpError.NotFound("Failed to find user account");

    return NextResponse.json(user);
  } catch (error) {
    return onError(error);
  }
};

export const DELETE = async () => {
  try {
    const session = await getServerSession(authConfig);
    if (!session) throw createHttpError.Unauthorized();

    const result = await prisma.user.delete({
      where: {
        id: session.user.id,
      },
    });

    logger.info(result, "Deleted User account");

    return NextResponse.json({
      status: 200,
      message: "account deleted",
      date: new Date(),
    });
  } catch (error) {
    return onError(error);
  }
};
