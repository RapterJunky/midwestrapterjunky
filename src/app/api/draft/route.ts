import createHttpError from "http-errors";
import { draftMode } from "next/headers";
import { z } from "zod";

import { logger } from "@lib/logger";
import onError from "@api/onError";

const slugValidation = z.string().startsWith("/");

export function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  if (searchParams.get("secret") !== process.env.PREVIEW_TOKEN)
    return onError(createHttpError.Unauthorized());

  const result = slugValidation.safeParse(searchParams.get("slug"));

  if (!result.success) return onError(result.error);

  logger.info(`(${new Date().toISOString()}) Enabled Daft Mode`);

  draftMode().enable();

  return Response.redirect(`http://${process.env.VERCEL_URL}${result.data}`);
}
