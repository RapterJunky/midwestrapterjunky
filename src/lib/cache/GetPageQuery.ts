import "server-only";
import { draftMode } from 'next/headers';
import { cache } from "react";
import { DatoCMS } from "@api/gql";

const getPageQuery = <T = unknown>(query: string, variables?: Record<string, unknown>) => cache(async () => {
    const { isEnabled } = draftMode();
    const data = await DatoCMS({ query, variables }, { draft: isEnabled });
    return data as T;
});

export default getPageQuery;