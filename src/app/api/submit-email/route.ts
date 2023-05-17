import { type NextRequest, NextResponse } from "next/server";
import { fromZodError } from "zod-validation-error";
import validate from "deep-email-validator";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { z, ZodError } from "zod";

import { logger } from "@lib/logger";
import prisma from "@api/prisma";
import ratelimit from "@api/rateLimit";

const emailValidator = z.object({
  email: z
    .string()
    .email()
    .superRefine(async (email, ctx) => {
      const result = await validate({ email, validateRegex: false });
      if (!result.valid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            result.validators[result.reason as keyof typeof result.validators]
              ?.reason ?? "Failed to vaild email.",
          fatal: true,
        });
        return z.NEVER;
      }
    }),
});

export const POST = async (request: NextRequest) => {
  let message = "The server encountered an error.";
  let ok = false;

  const { success, remaining, reset, limit } = await ratelimit(request.ip);

  if (!success)
    return NextResponse.json(
      {
        message: "Too Many Requests",
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
        },
      }
    );

  try {
    const body = await request.formData();
    const { email } = await emailValidator.parseAsync({
      email: body.get("email"),
    });

    await prisma.mailingList.create({
      data: {
        email,
      },
    });

    ok = true;
    message = "Your email was add to the mailing list.";
  } catch (error) {
    if (error instanceof ZodError) {
      const status = fromZodError(error);
      message = status.message;
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case "P2002": {
          message = `The given email has already been added to the mailing list.`;
          break;
        }
      }
    }

    logger.error(error, "Mailing list error");
  }

  return NextResponse.redirect(
    new URL(
      `/confirmation?mode=email&status=${
        ok ? "ok" : "error"
      }&message=${encodeURIComponent(message)}`,
      request.nextUrl.origin
    ),
    {
      headers: {
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": reset.toString(),
      },
      status: 302,
    }
  );

  redirect(
    `/confirmation?mode=email&status=${
      ok ? "ok" : "error"
    }&message=${encodeURIComponent(message)}`
  );
};