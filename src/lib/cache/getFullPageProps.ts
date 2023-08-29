import "server-only";
import { cache } from "react";
import GenericPageQuery from "@query/queries/generic";
import type { FullPageProps } from "@type/page";
import { DatoCMS } from "@api/gql";

const getFullPageProps = cache(async () => {
  const data = await DatoCMS(
    {
      query: GenericPageQuery,
    },
    {
      next: {
        tags: ["navbar"],
      },
    },
  );

  return data as FullPageProps;
});

export default getFullPageProps;
