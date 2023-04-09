import type { Prisma } from "@prisma/client";
import { DatoCMS } from "@api/gql";
import prisma from "@api/prisma";

export const fetchCachedQuery = async <R = unknown>(
  key: string,
  query: string,
  opt?: { ci?: boolean; preview?: true }
): Promise<R> => {
  const request = async (preview = false) => DatoCMS(query, { preview });
  if (opt?.preview) return request(true) as Promise<R>;

  let cache = await prisma.cache.findFirst({ where: { key } });

  if (!cache || cache.isDirty || opt?.ci) {
    const data = (await request()) as Prisma.InputJsonValue;
    cache = await prisma.cache.upsert({
      create: {
        key,
        data,
        isDirty: false,
      },
      update: {
        data,
        isDirty: false,
      },
      where: {
        key,
      },
    });
  }

  return cache.data as R;
};

export const fetchCacheData = async <R = unknown>(
  key: string,
  fetch: () => Promise<object>,
  ci = false
): Promise<R> => {
  let pages = await prisma.cache.findFirst({ where: { key } });
  if (!pages || pages.isDirty || ci) {
    const data = await fetch();

    pages = await prisma.cache.upsert({
      create: {
        key,
        data,
        isDirty: false,
      },
      update: {
        data,
        isDirty: false,
      },
      where: {
        key,
      },
    });
  }

  return pages.data as R;
};
