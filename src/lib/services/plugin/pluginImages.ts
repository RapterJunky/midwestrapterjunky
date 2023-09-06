import { NextResponse } from "next/server";
import createHttpError from "http-errors";
import { z } from "zod";

import { GOOGLE_DRIVE_IMAGE_ROOT } from "@utils/googleConsts";
import googleDrive, { generateImageBlur } from "@api/googleDrive";

const schema = z.object({
  cursor: z.string().optional(),
  sort: z.enum(["user_upload", "cms_upload"]).optional(),
  type: z.enum(["list", "blurthumb"]).default("list"),
  q: z.string().optional(),
  id: z.string().or(z.array(z.string())).optional(),
});

const deleteSchema = z.object({
  id: z.string(),
});

const getBlur = async (imageId: string) => {
  const rawImage = await fetch(`${GOOGLE_DRIVE_IMAGE_ROOT}${imageId}`);
  const buffer = await rawImage.arrayBuffer();

  const blurthumb = generateImageBlur(buffer);

  return {
    id: imageId,
    blurthumb,
  };
};

async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const { q, cursor, type, sort, id } = schema.parse(
    Object.fromEntries(searchParams.entries()),
  );

  const drive = googleDrive();

  if (type === "list") {
    const images = await drive.files.list({
      pageToken: cursor,
      pageSize: 50,
      fields:
        "nextPageToken, files(id, name,appProperties, imageMediaMetadata(width,height) )",
      q: `trashed = false and mimeType != \'application/vnd.google-apps.folder\' and visibility = 'anyoneWithLink'${
        sort ? ` and appProperties has { key='label' and value='${sort}' }` : ""
      }${q ? ` and fullText contains '${q}'` : ""}`,
    });

    return NextResponse.json({
      result: images.data.files,
      nextCursor: images.data.nextPageToken,
      hasNextPage: !!images.data.nextPageToken,
    });
  }

  if (!id) throw createHttpError.BadRequest("Missing image id");

  if (Array.isArray(id)) {
    const blurs = await Promise.all(id.map((value) => getBlur(value)));
    return NextResponse.json(blurs);
  }

  const blur = await getBlur(id);

  return NextResponse.json([blur]);
}

async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);

  const { id } = deleteSchema.parse(Object.fromEntries(searchParams.entries()));

  const drive = googleDrive();

  if (id === "emptyTrash") {
    await drive.files.emptyTrash();
    return NextResponse.json({ status: "ok" });
  }

  await drive.files.delete({
    fileId: id,
    fields: "id",
  });

  return NextResponse.json({ status: "ok" });
}

const handlers = {
  DELETE,
  GET,
};

export default handlers;
