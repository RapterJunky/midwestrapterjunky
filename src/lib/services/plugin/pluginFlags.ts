import { NextResponse } from "next/server";
import { z } from "zod";
import { logger } from "@lib/logger";

const schema = z.record(
  z.object({
    id: z.number(),
    value: z.boolean(),
  }),
);

async function GET() {
  const response = await fetch(
    `https://api.configcat.com/v1/configs/${process.env.CONFIG_CAT_CONFIG_ID}/environments/${process.env.CONFIG_CAT_ENV}/values`,
    {
      headers: {
        Authorization: `Basic ${process.env.CONFIG_CAT_MANAGEMENT}`,
      },
    },
  );

  if (!response.ok) {
    logger.error(response, response.statusText);
    throw new Error("Failed to fetch feature flags");
  }
  const data = (await response.json()) as { settingValues: unknown };
  return NextResponse.json(data.settingValues);
}

async function PUT(request: Request) {
  const body = await request.json();
  const data = schema.parse(body);

  const results = await Promise.allSettled(
    Object.values(data).map(async (flag) => {
      const response = await fetch(
        `https://api.configcat.com/v1/environments/${process.env.CONFIG_CAT_ENV}/settings/${flag.id}/value`,
        {
          method: "PUT",
          body: JSON.stringify({
            value: flag.value,
          }),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${process.env.CONFIG_CAT_MANAGEMENT}`,
          },
        },
      );

      if (!response.ok) throw response;
      return response;
    }),
  );

  for (const result of results) {
    if (result.status === "rejected") {
      logger.error(
        result.reason as unknown,
        (result.reason as Response).statusText,
      );
    }
  }

  return NextResponse.json("", { status: 204 });
}

const handlers = {
  PUT,
  GET,
};

export default handlers;
