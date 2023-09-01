import TopicCard from "@/components/community/TopicCard";
import TopicTable from "@/components/community/TopicTable";
import getSuggested from "@/lib/services/community/getSuggested";

const SuggestedPosts: React.FC<{ tags: string[], ignore: string; }> = async (props) => {
    const suggested = await getSuggested(props);

    return (
        <>
            <TopicTable>
                <tbody className="divide-y">
                    {suggested.map((item, i) => (
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
            {!suggested.length ? (
                <div className="flex justify-center border-t-2">
                    <span className="mt-4 p-2 text-neutral-600">
                        Theres anything to suggest yet.
                    </span>
                </div>
            ) : null}
        </>
    );
}
export default SuggestedPosts;