import Link from "next/link";
import type { SearchQueryResult } from "@/gql/sqaure/searchQuery";
import CatalogPrevButton from "./CatalogPrevButton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CatalogPagination: React.FC<SearchQueryResult["catalogItems"]["pageInfo"] & { query: URLSearchParams }> = ({ query, nextCursor }) => {

    const nextQuery = query;
    if (nextCursor) nextQuery.set("cursor", encodeURIComponent(nextCursor))

    return (
        <>
            <li>
                <CatalogPrevButton />
            </li>
            <li>
                <Button asChild title="Next Page" className={cn({ "pointer-events-none opacity-50": !nextCursor })}>
                    <Link prefetch={false} href={{ search: nextQuery.toString() }}>
                        Next
                    </Link>
                </Button>
            </li>

        </>
    );
}

export default CatalogPagination;