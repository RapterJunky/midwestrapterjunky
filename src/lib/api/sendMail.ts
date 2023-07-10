import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import mail from "@sendgrid/mail";

import { logger } from "@lib/logger";

type Props = {
  to: string;
  templete?: {
    id: string;
    data: Record<string, unknown>;
  };
  data?: {
    subject: string;
    text: string;
    html: string;
  };
};

const rateLimiter = new Ratelimit({
  redis: new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  }),
  limiter: Ratelimit.slidingWindow(1, "3600 s"), // once an hour
  analytics: false,
  prefix: "ratelimit/mail",
});

const emailFrom = "rapter@gmail.com";

const sendMail = async ({ templete, data, to }: Props, id: string) => {
  try {
    mail.setApiKey(process.env.SENDGIRD_API_KEY);
    const sandbox = process.env.VERCEL_ENV !== "production";

    const { success, limit, remaining, reset } = await rateLimiter.limit(id);

    if (!success) {
      logger.info(
        { templete: !!templete, id, sandbox, limit, remaining, reset },
        `Rate limiting mail for (${id})`,
      );
      return true;
    }

    let email: mail.MailDataRequired | undefined;

    if (templete) {
      email = {
        from: emailFrom,
        to,
        templateId: templete.id,
        dynamicTemplateData: templete.data,
      };
    }

    if (data) {
      email = {
        from: emailFrom,
        to,
        text: data.text,
        html: data.html,
        subject: data.subject,
      };
    }

    if (!email || (!data && !templete))
      throw new Error("No templete or email data was given.");

    email.mailSettings = {
      sandboxMode: {
        enable: process.env.VERCEL_ENV !== "production",
      },
    };

    await mail.send(email);

    logger.info(
      {
        templete: !!templete,
        id,
        sandbox,
        limit,
        remaining,
        reset,
      },
      "Mail sent",
    );

    return true;
  } catch (error) {
    logger.error(error, "Failed to send email");
    return false;
  }
};

export default sendMail;
