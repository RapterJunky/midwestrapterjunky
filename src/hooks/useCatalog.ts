import { type CursorPaginate } from '@/types/page';
import useSWR from 'swr';

export type ShopItem = {
    name: string,
    id: string,
    image: null | { url: string; alt: string; },
    price: string;
    category: string | null
}

export type Sort = "latest" | "lth" | "htl";

interface Opt {
    cursor?: string;
    query?: string;
    vendor?: string;
    sort?: Sort;
    category?: string,
    limit?: number;
}

const useCatalog = (opt: Opt) => {
    const { data, isLoading, error } = useSWR(["/api/shop/catalog", opt], async ([url, { cursor, query, vendor, sort, category, limit }]) => {
        const params = new URLSearchParams();

        if (cursor) params.set("cursor", cursor);
        if (category) params.set("category", category);
        if (query) params.set("query", query);
        if (vendor) params.set("vendor", vendor);
        if (sort) params.set("sort", sort);
        if (limit) params.set("limit", limit.toString());

        const request = await fetch(`${url}?${params.toString()}`);
        if (!request) throw request;
        return request.json() as Promise<CursorPaginate<ShopItem>>
    });

    return {
        data,
        isLoading,
        error
    }
}
export default useCatalog;