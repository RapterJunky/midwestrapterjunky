import prisma from "@api/prisma";

export const fetchCacheData = async <R = unknown>(
  key: string,
  fetch: () => Promise<any>,
  ci: boolean = false
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
