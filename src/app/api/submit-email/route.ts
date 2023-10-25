import { type NextRequest, NextResponse } from "next/server";
import { fromZodError } from "zod-validation-error";
import validate from "deep-email-validator";
import client from "@sendgrid/client";
import { z, ZodError } from "zod";

import ratelimit from "@api/rateLimit";
import { logger } from "@lib/logger";

const emailValidator = z.object({
  email: z
    .string()
    .email()
    .max(254)
    .superRefine(async (email, ctx) => {
      console.time("Vaildate Time");
      const { valid, reason, validators } = await validate({
        email,
        validateRegex: true,
        validateMx: true,
      });
      console.timeEnd("Vaildate Time");
      if (!valid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            validators[reason as keyof typeof validators]
              ?.reason ?? "Failed to vaildate email.",
          fatal: true,
        });
        return z.NEVER;
      }
    }),
});

export const maxDuration = 15;

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
      },
    );

  try {
    const body = await request.formData();
    const { email } = await emailValidator.parseAsync({
      email: body.get("email"),
    });

    if (process.env.VERCEL_ENV === "production") {
      client.setApiKey(process.env.SENDGIRD_API_KEY);

      const response = await client.request({
        url: `/v3/marketing/contacts`,
        method: "PUT",
        body: {
          contacts: [
            {
              email,
            },
          ],
        },
      });
      logger.info(response, "Add email to mailing list");
    }

    ok = true;
    message = "Your email was add to the mailing list.";
  } catch (error) {
    if (error instanceof ZodError) {
      const status = fromZodError(error);
      message = status.message.replace(`at "email"`, "");
    }

    logger.error(error, "Mailing list error");
  }

  return NextResponse.redirect(
    new URL(
      `/confirmation?mode=email&status=${ok ? "ok" : "error"
      }&message=${encodeURIComponent(message)}`,
      request.nextUrl.origin,
    ),
    {
      headers: {
        //"X-RateLimit-Limit": limit.toString(),
        //"X-RateLimit-Remaining": remaining.toString(),
        //"X-RateLimit-Reset": reset.toString(),
      },
      status: 302,
    },
  );
};
