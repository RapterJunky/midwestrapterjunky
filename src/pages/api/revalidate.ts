import type { NextApiRequest, NextApiResponse } from "next";
import createHttpError from "http-errors";
import { buildClient } from "@datocms/cma-client-node";
import { logger } from "@lib/logger";
import prisma from "@api/prisma";
export interface RevaildateSettings {
  type: "page" | "cache" | "page-cache" | "build";
  slug?: string;
  cache?: string;
}

export interface WebhookRequest {
  environment: string;
  entity_type: string;
  event_type: "delete" | "unpublish" | "publish";
  entity: {
    id: string;
    type: string;
    attributes: {
      id: string;
      slug?: string;
      revalidate?: string;
    };
    relationships: {};
    meta: {
      created_at: string;
      updated_at: string;
      published_at: string | null;
      publication_scheduled_at: string | null;
      unpublishing_scheduled_at: string | null;
      first_published_at: string | null;
      is_valid: boolean;
      is_current_version_valid: boolean;
      is_published_version_valid: boolean | null;
      status: string;
      current_version: string;
      stage: null | string;
    };
  };
}

const BUILD_TRIGGER_ID = "22379";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "POST") throw createHttpError.MethodNotAllowed();
    if (
      !req.headers?.authorization ||
      req.headers.authorization !== `Bearer ${process.env.REVALIDATE_TOKEN}`
    )
      throw createHttpError.Unauthorized();
    if (
      !req.headers["x-environment"] ||
      !req.headers["x-site-id"] ||
      !req.headers["x-webhook-id"]
    )
      throw createHttpError.BadRequest();

    const body = req.body as WebhookRequest;
    const data = JSON.parse(
      body.entity.attributes?.revalidate ?? "null"
    ) as RevaildateSettings | null;

    if (!data) return res.status(200).json({ revaildate: false });

    switch (data.type) {
      case "page":
        if (!data.slug) throw createHttpError.BadRequest();
        if (body.event_type === "publish")
          await res.revalidate(
            data.slug
              .replace("[slug]", body.entity.attributes?.slug ?? "")
              .replace("[id]", body.entity.attributes.id)
          );
        return res.status(200).json({ revalidated: true });
      case "cache":
        if (!data?.cache) throw createHttpError.BadRequest();
        await prisma.cache.update({
          where: { key: data.cache },
          data: { isDirty: true },
        });
        return res.status(200).json({ revalidated: true });
      case "build":
        await prisma.cache.updateMany({
          where: { isDirty: false },
          data: { isDirty: true },
        });
        const client = buildClient({
          apiToken: process.env.DATOCMS_CLIENT_TOKEN,
        });
        await client.buildTriggers.trigger(BUILD_TRIGGER_ID);
        return res.status(200).json({ revalidated: true });
      case "page-cache":
        if (!data?.slug || !data?.cache) throw createHttpError.BadRequest();
        if (body.event_type === "publish")
          await res.revalidate(
            data.slug
              .replace("[slug]", body.entity.attributes?.slug ?? "")
              .replace("[id]", body.entity.attributes.id)
          );
        await prisma.cache.update({
          where: { key: data.cache },
          data: { isDirty: true },
        });
        return res.status(200).json({ revalidated: true });
      default:
        return res.status(200).json({ revalidated: false });
    }
  } catch (error: any) {
    if (createHttpError.isHttpError(error)) {
      logger.error(error, error.message);
      return res
        .status(error.statusCode)
        .json({ ...error, revaildated: false });
    }

    logger.error(error, "Internal Server Error");

    res.status(500).json({
      revalidated: false,
    });
  }
}
