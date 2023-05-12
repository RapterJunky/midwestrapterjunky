import { cache } from "react";
import "server-only";

import GenericPageQuery from "@query/queries/generic";
import type { FullPageProps } from "@type/page";
import { fetchCachedQuery } from "@lib/cache";

const getFullPageProps = cache(async () => {
  const data = await fetchCachedQuery<FullPageProps>(
    "GenericPage",
    GenericPageQuery
  );
  return data;
});

export default getFullPageProps;
