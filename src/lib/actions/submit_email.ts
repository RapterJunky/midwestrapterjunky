"use server";
import { fromZodError } from "zod-validation-error";
import { redirect } from "next/navigation";
import client from "@sendgrid/client";
import { z } from "zod";
import validate from "@lib/deep_email_validator";
import { logger } from "@lib/logger";

const emailValidator = z.object({
  email: z
    .string()
    .email()
    .max(254)
    .superRefine(async (email, ctx) => {
      console.time("Email Vaildate Time");
      const { valid, reason } = await validate({
        email,
        /**
         * Can't use SMTP do to vercel blocking it
         * @see https://github.com/vercel/vercel/discussions/4857
         */
        validateSMTP: false,
      });
      console.timeEnd("Email Vaildate Time");
      if (!valid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: reason,
          /*validators[reason as keyof typeof validators]
                ?.reason ?? "Failed to vaildate email."*/ fatal: true,
        });
        return z.NEVER;
      }
    }),
});

const submitEmail = async (
  prevState: unknown,
  formData: FormData,
): Promise<{ error: string | null }> => {
  const valid = await emailValidator.safeParseAsync({
    email: formData.get("email"),
  });

  if (!valid.success) {
    const error = fromZodError(valid.error);
    return { error: error.message.replace('at "email"', "") };
  }

  const email = valid.data.email;

  if (process.env.VERCEL_ENV === "production") {
    client.setApiKey(process.env.SENDGIRD_API_KEY);
    const [response] = await client.request({
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

    if (response.statusCode !== 202) {
      logger.error(
        {
          statusCode: response.statusCode,
          body: response.body,
        },
        "Failed to add email to mailing list.",
      );
      return { error: "Failed to add email to mailing list. Try again later." };
    }
  }

  redirect(
    `/confirmation?mode=email&status=ok&message=${encodeURIComponent(
      "Your email was add to the mailing list.",
    )}`,
  );
};

export default submitEmail;
