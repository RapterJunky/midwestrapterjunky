import "server-only";

import GenericPageQuery from "@query/queries/generic";
import type { FullPageProps } from "@type/page";
import { DatoCMS } from "@api/gql";

const getFullPageProps = async () => {
  const data = await DatoCMS(
    {
      query: GenericPageQuery,
    },
    {
      next: {
        tags: ["navbar"],
      },
    }
  );

  return data as FullPageProps;
};

export default getFullPageProps;
