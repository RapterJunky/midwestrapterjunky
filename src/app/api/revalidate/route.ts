import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import createHttpError from "http-errors";
import { logger } from "@/lib/logger";

type RevalidatePage = { type: "page"; slug: string };
type RevalidatePages = { type: "pages"; slugs: string[] };
type RevalidateTags = { type: "tags"; tags: string[] };

export type RevalidateSettings =
  | RevalidatePage
  | RevalidatePages
  | RevalidateTags;
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
    relationships: object;
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

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get("authorization");
    if (
      !authorization ||
      authorization !== `Bearer ${process.env.REVALIDATE_TOKEN}`
    )
      throw createHttpError.Unauthorized();
    if (
      !request.headers.get("x-environment") ||
      !request.headers.get("x-site-id") ||
      !request.headers.get("x-webhook-id")
    )
      throw createHttpError.BadRequest();

    const body = (await request.json()) as WebhookRequest;

    const data = JSON.parse(
      body.entity.attributes?.revalidate ?? "null",
    ) as RevalidateSettings | null;

    if (!data)
      return NextResponse.json(
        { revalidate: false, message: "No props for revalidating" },
        { status: 400 },
      );

    switch (data.type) {
      case "page": {
        if (!data.slug) throw createHttpError.BadRequest();
        if (body.event_type === "publish") {
          const path = data.slug
            .replace("[title]", "[slug]") // patch
            .replace("[slug]", body.entity.attributes?.slug ?? "")
            .replace("[id]", body.entity.attributes.id);

          revalidatePath(path);
        }
        return NextResponse.json({ revalidate: true });
      }
      case "tags": {
        if (!data.tags.length)
          throw createHttpError.BadRequest("Nothing to revalidate");

        for (const tag of data.tags) {
          revalidateTag(tag);
        }

        return NextResponse.json({ revalidate: true });
      }
      case "pages": {
        const slugs = data.slugs;
        if (!slugs?.length) throw createHttpError.BadRequest();

        for (const page of data.slugs) {
          revalidatePath(page);
        }

        return NextResponse.json({ revalidate: true });
      }
    }
  } catch (error) {
    logger.error(error);

    if (createHttpError.isHttpError(error)) {
      return NextResponse.json(
        { ...error, revalidated: false },
        { status: error.statusCode },
      );
    }

    return NextResponse.json(
      {
        revalidated: false,
        message: (error as Error)?.message ?? "Unknown error",
      },
      { status: 500 },
    );
  }
}
