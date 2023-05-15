import { NextResponse } from "next/server";
import createHttpError from "http-errors";
import { z } from "zod";

import { getKeys, addKeys, dropKeys } from "@lib/dynamic_keys";
import onError from "@api/onError";
import { auth } from "@api/auth";

const patchVaildation = z
  .array(
    z.object({
      key: z.string().transform((value) => value.toUpperCase()),
      value: z.string(),
    })
  )
  .nonempty();

const getVaildataion = z
  .array(z.string().transform((value) => value.toUpperCase()))
  .nonempty();

export const PATCH = async (request: Request) => {
  try {
    auth(process.env.KEYS_TOKEN);
    const body = await request.json();
    const data = patchVaildation.parse(body);

    const count = await addKeys(data);

    return NextResponse.json(count, { status: 202 });
  } catch (error) {
    return onError(error);
  }
};

export const POST = async (request: Request) => {
  try {
    auth(process.env.KEYS_TOKEN);
    const body = await request.json();
    const data = patchVaildation.parse(body);
    const count = await addKeys(data);

    return NextResponse.json(count, { status: 201 });
  } catch (error) {
    return onError(error);
  }
};

export const GET = async (request: Request) => {
  try {
    auth(process.env.KEYS_TOKEN);
    const params = new URL(request.url).searchParams;
    const keys = params.getAll("q");
    if (!keys || !keys.length) throw createHttpError.BadRequest();

    const data = getVaildataion.parse(keys);
    const pairs = await getKeys(data);

    return NextResponse.json(pairs, { status: 200 });
  } catch (error) {
    return onError(error);
  }
};

export const DELETE = async (request: Request) => {
  try {
    auth(process.env.KEYS_TOKEN);
    const params = new URL(request.url).searchParams;
    const query = params.getAll("q");
    if (!query || !query.length) throw createHttpError.BadRequest();

    const { keys } = z.object({ keys: getVaildataion }).parse(query);

    const count = await dropKeys(keys);

    return NextResponse.json(count, { status: 200 });
  } catch (error) {
    return onError(error);
  }
};
