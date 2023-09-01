import TopicTable from "@/components/community/TopicTable";
import TopicCard from "@/components/community/TopicCard";
import getPosts from "@/lib/services/community/getPosts";

const CommunityPosts: React.FC<{ type: "latest" | "top" }> = async ({ type }) => {

    const posts = await getPosts(type);

    return (
        <>
            <TopicTable>
                <tbody className="divide-y">
                    {posts.map((item, i) => (
                        <TopicCard
                            pinned={item.pinned}
                            locked={item.locked}
                            key={i}
                            activity={item.comments.at(0)?.updatedAt}
                            title={item.name}
                            slug={`/community/p/${item.id}`}
                            tags={item.tags as string[]}
                            description=""
                            replies={item.comments.length}
                        />
                    ))}
                </tbody>
            </TopicTable>
            {!posts.length ? (
                <div className="flex justify-center border-t-2">
                    <span className="mt-4 p-2 text-neutral-600">
                        Does not look like theres anything there yet.
                    </span>
                </div>
            ) : null}
        </>
    );
}

export default CommunityPosts;