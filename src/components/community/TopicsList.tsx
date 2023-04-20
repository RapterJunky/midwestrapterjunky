import { useVirtualizer } from "@tanstack/react-virtual";
import useSWRInfinite from 'swr/infinite';
import { useRef } from 'react';

import TopicTable from "@components/community/TopicTable";
import TopicCard from "@components/community/TopicCard";
import { singleFetch } from "@api/fetch";
import { Paginate } from "@type/page";

type Props = {
    mode: "top" | "latest" | "suggest",
    tags?: string[],
    ignore?: string;
}

type Post = {
    id: string;
    name: string;
    locked: boolean,
    pinned: boolean,
    tags: string[]
    comments: {
        updatedAt: string;
    }[];
};

const TopicsList: React.FC<Props> = ({ mode, tags = [], ignore }) => {
    const wrapper = useRef<HTMLTableSectionElement>(null);
    const { data, size, setSize, error, isLoading } = useSWRInfinite<Paginate<Post>, Response>((index: number, previousData: Paginate<Post>) => {
        if (previousData?.isLastPage) return null;
        return `/api/community?page=${index + 1}&sort=${mode}${ignore ? `&ignore=${ignore}` : ""}${mode === "suggest" ? `&tags=${tags.map(item => encodeURIComponent(item)).join("&tags=")}` : ""}`;
    }, singleFetch as () => Promise<Paginate<Post>>, {
        revalidateOnFocus: false
    });

    const items = data?.reduce((arr, curr) => {
        arr.push(curr.result);
        return arr;
    }, [] as Post[][]).flat() ?? [];

    const rowVirtualizer = useVirtualizer({
        count: items.length,
        getScrollElement: () => wrapper.current,
        estimateSize: () => 100,
        overscan: 5
    });

    return (
        <>
            <TopicTable>
                <tbody ref={wrapper} className="divide-y-2">
                    {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                        const item = items[virtualRow.index];
                        if (!item) throw new Error("Unable to get item");
                        return (
                            <TopicCard pinned={item.pinned} locked={item.locked} key={virtualRow.key} activity={item.comments.at(0)?.updatedAt} title={item.name} slug={`/community/p/${item.id}`} tags={item.tags} description="" replies={item.comments.length} />
                        );
                    })}
                </tbody>
            </TopicTable>
            {!error && !isLoading && !items.length ? (
                <div className="flex justify-center border-t-2">
                    <span className="p-2 mt-4 text-neutral-600">Does not look like theres anything there yet.</span>
                </div>
            ) : null}
            {error ? (
                <div className="flex justify-center border-t-2">
                    <span className="p-2 mt-4 text-neutral-600">There was an error.</span>
                </div>
            ) : null}
            {isLoading ? (
                <div className="flex justify-center border-t-2">
                    <span className="p-2 mt-4 text-neutral-600">Loading Data...</span>
                </div>
            ) : null}
            {mode !== "suggest" ? (
                <div className="flex justify-center mt-4">
                    <button className="inline-block rounded-sm bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 ui-active:bg-primary-700 ui-active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] disabled:pointer-events-none disabled:opacity-70" disabled={data?.at((data?.length ?? 0) - 1)?.isLastPage ?? true} onClick={() => setSize(size + 1)}>Load More</button>
                </div>
            ) : null}
        </>
    );
}

export default TopicsList;