import createHttpError from "http-errors";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { Client } from "square";
import { serialize } from "superjson";
import { authConfig } from "@/lib/config/auth";
import onError from "@api/handleError";
import prisma from "@api/prisma";

export const dynamic = "force-dynamic";

export const GET = async () => {
  try {
    const session = await getServerSession(authConfig);
    if (!session) throw createHttpError.Unauthorized();

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
    });

    if (!user) throw createHttpError.NotFound("Failed to find user profile");

    const client = new Client({
      accessToken: process.env.SQAURE_ACCESS_TOKEN,
      environment: process.env.SQUARE_MODE,
    });

    if (!user.sqaureId && !user.email)
      throw createHttpError.BadRequest(
        "Can not create customer account without email.",
      );

    if (!user.sqaureId) {
      const response = await client.customersApi.createCustomer({
        emailAddress: user.email as string,
        referenceId: user.id,
        idempotencyKey: user.id,
      });

      const customer = response.result.customer ?? null;

      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          sqaureId: customer?.id,
        },
      });

      const { json } = serialize(customer);

      return NextResponse.json(json);
    }

    const sqaureCustom = await client.customersApi.retrieveCustomer(
      user.sqaureId,
    );

    const customer = sqaureCustom.result.customer ?? null;
    const { json } = serialize(customer);

    return NextResponse.json(json);
  } catch (error) {
    return onError(error);
  }
};
