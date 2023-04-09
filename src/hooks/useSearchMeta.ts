import { useRouter } from "next/router";
import type { Sort } from "@/hooks/useCatalog";

const useSearchMeta = () => {
  const router = useRouter();

  return {
    cursor: Array.isArray(router.query?.cursor)
      ? router.query?.cursor[0]
      : router.query?.cursor,
    category: Array.isArray(router.query?.category)
      ? router.query?.category[0]
      : router.query?.category,
    query: Array.isArray(router.query?.query)
      ? router.query?.query[0]
      : router.query?.query,
    sort: (Array.isArray(router.query?.sort)
      ? router.query.sort[0]
      : router.query?.sort) as Sort | undefined,
    vendor: undefined,
  };
};

export default useSearchMeta;
