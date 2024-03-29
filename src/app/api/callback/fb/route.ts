import { NextResponse, type NextRequest } from "next/server";
import { createHmac, randomBytes } from "node:crypto";
import createHttpError from "http-errors";
import { z } from "zod";

import { logger } from "@lib/logger";
import onError from "@api/handleError";
import prisma from "@api/prisma";

interface JSONWebToken {
  algorithm: string;
  user_id: string;
}

function urlDecode(value: string) {
  return value.replace(/-/g, "+").replace(/_/g, "/");
}

const checkSchema = z.string().uuid();

export const GET = (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);

    const id = checkSchema.parse(searchParams.get("code"));
    logger.info(`Facebook deletion status request ${id}`);

    return NextResponse.json({
      status: "deleted",
    });
  } catch (error) {
    return onError(error);
  }
};

/**
 * Facebook callback for deleting account from facebook dashboard.
 *
 *
 * @linkcode https://gist.github.com/fjahn/112ecdd690ba72340deb17169554f016
 * @see https://developers.facebook.com/community/threads/283327892978721/
 */
export const POST = async (request: NextRequest) => {
  try {
    //
    // get Signed Request
    //
    const body = await request.formData();
    const signed_request = body.get("signed_request")?.toString();
    if (!signed_request) throw createHttpError.BadRequest("Invaild format");

    //
    // get signature and payload from signed request
    //

    const [encodedSignature, payload] = signed_request.split(".", 2);
    if (!encodedSignature || !payload)
      throw createHttpError.BadRequest("Signed request has invaild format");

    const signature = urlDecode(encodedSignature);

    //
    // validate signature
    //

    const hmac = createHmac("sha256", process.env.FACEBOOK_CLIENT_SECRET);
    const expectedSignature = hmac.update(payload).digest("base64");
    const actualSignatureWithEqualsSign = signature + "=";

    if (actualSignatureWithEqualsSign !== expectedSignature)
      throw createHttpError.Unauthorized("Invaild signature");

    const data = JSON.parse(
      Buffer.from(urlDecode(payload), "base64url").toString("utf-8"),
    ) as JSONWebToken;

    logger.info("Facebook account deleteion in progress");

    const accountUser = await prisma.account.findFirst({
      where: {
        providerAccountId: data.user_id,
      },
      select: {
        userId: true,
      },
    });
    if (!accountUser) throw createHttpError.NotFound();

    await prisma.user.delete({
      where: {
        id: accountUser.userId,
      },
    });

    return NextResponse.json({
      url: `${process.env.VERCEL_ENV === "development" ? "http" : "https"}://${
        process.env.VERCEL_URL
      }/api/callback/fb`,
      confirmation_code: randomBytes(10).toString("hex"),
    });
  } catch (error) {
    return onError(error);
  }
};
