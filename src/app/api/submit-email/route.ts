import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { fromZodError } from "zod-validation-error";
import { z, ZodError } from "zod";

import { logger } from "@lib/logger";
import prisma from "@api/prisma";

const emailValidator = z.object({
  email: z.string().email(),
});

export const POST = async (request: Request) => {
  let message = "The server encountered an error.";
  let ok = false;
  try {
    const body = await request.formData();
    const { email } = emailValidator.parse({ email: body.get("email") });

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

  redirect(
    `/confirmation?mode=email&status=${
      ok ? "ok" : "error"
    }&message=${encodeURIComponent(message)}`
  );
};
