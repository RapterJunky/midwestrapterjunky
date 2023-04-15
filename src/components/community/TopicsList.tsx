import { useVirtualizer } from "@tanstack/react-virtual";
import useSWRInfinite from 'swr/infinite';
import { useRef } from 'react';
import { Paginate } from "@/types/page";
import TopicCard from "./TopicCard";
import TopicTable from "./TopicTable";

type Post = {
    id: string;
    name: string;
    comments: {
        created: string;
    }[];
};

const fetcher = (url: string) => fetch(url).then(e => {
    if (!e.ok) throw e;
    return e;
}).then(e => e.json()) as Promise<Paginate<Post>>;

const TopicsList: React.FC<{ mode: "top" | "latest" }> = ({ mode }) => {
    const wrapper = useRef<HTMLTableSectionElement>(null);
    const { data, size, setSize, error, isLoading } = useSWRInfinite<Paginate<Post>, Response>((index: number, previousData: Paginate<Post>) => {
        if (previousData?.isLastPage) return null;
        return `/api/community?page=${index + 1}&sort=${mode}`;
    }, fetcher);

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
                            <TopicCard key={virtualRow.key} activity={item.comments.at(0)?.created} title={item.name} slug={`/community/p/${item.id}`} tags={["Getting Started"]} description="" replies={item.comments.length} />
                        );
                    })}
                </tbody>
            </TopicTable>
            {error ? (
                <div className="flex justify-center">
                    <span className="p-2">There was an error.</span>
                </div>
            ) : null}
            {isLoading ? (
                <div className="flex justify-center">
                    <span className="p-2">Loading Data...</span>
                </div>
            ) : null}
            <div className="flex justify-center mt-4">
                <button className="inline-block rounded-sm bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 ui-active:bg-primary-700 ui-active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] disabled:pointer-events-none disabled:opacity-70" disabled={data?.at((data?.length ?? 0) - 1)?.isLastPage ?? true} onClick={() => setSize(size + 1)}>Load More</button>
            </div>
        </>
    );
}

export default TopicsList;