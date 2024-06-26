import createHttpError from "http-errors";
import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { z } from "zod";
import onError from "@api/handleError";
import { logger } from "@lib/logger";

const slugValidation = z.string().startsWith("/");

export function GET(request: NextRequest) {
  const searchParams = new URL(request.url).searchParams;
  if (searchParams.get("secret") !== process.env.PREVIEW_TOKEN)
    return onError(createHttpError.Unauthorized());

  const result = slugValidation.safeParse(searchParams.get("slug"));

  if (!result.success) return onError(result.error);

  logger.info(`(${new Date().toISOString()}) Enabled Daft Mode`);

  draftMode().enable();

  redirect(result.data);
}
