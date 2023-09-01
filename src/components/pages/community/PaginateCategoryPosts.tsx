import TopicCard from "@/components/community/TopicCard";
import TopicTable from "@/components/community/TopicTable";
import { Button } from "@/components/ui/button";
import getCategoryPosts from "@/lib/services/community/getCategoryPosts";
import { cn } from "@/lib/utils";
import Link from "next/link";

const PaginateCategoryPosts: React.FC<{ category: number, page: number }> = async ({ category, page }) => {

    const { result, isFirstPage, isLastPage, pageCount, currentPage } = await getCategoryPosts(category, page);

    return (
        <>
            <TopicTable>
                <tbody className="divide-y">
                    {result.map((item, i) => (
                        <TopicCard
                            pinned={item.pinned}
                            locked={item.locked}
                            key={i}
                            activity={item.comments.at(0)?.updatedAt}
                            title={item.name}
                            slug={`/community/post/${item.id}`}
                            tags={item.tags as string[]}
                            description=""
                            replies={item.comments.length}
                        />
                    ))}
                </tbody>
            </TopicTable>
            {!result.length ? (
                <div className="flex justify-center border-t-2">
                    <span className="mt-4 p-2 text-neutral-600">
                        Does not look like theres anything there yet.
                    </span>
                </div>
            ) : null}
            <div className="mt-4 flex w-full justify-center">
                <div className="flex gap-2 items-center">
                    <Button asChild className={cn({ "pointer-events-none opacity-50": isFirstPage })}>
                        <Link href={{ search: `page=${currentPage - 1}` }}>Prev</Link>
                    </Button>
                    <div>
                        {currentPage} of {pageCount}
                    </div>
                    <Button asChild className={cn({ "pointer-events-none opacity-50": isLastPage })}>
                        <Link href={{ search: `page=${currentPage + 1}` }}>Next</Link>
                    </Button>
                </div>
            </div>
        </>
    );
}

export default PaginateCategoryPosts;