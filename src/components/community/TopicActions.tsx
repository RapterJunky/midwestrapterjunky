import { HiFlag, HiHeart, HiTrash } from "react-icons/hi";
import { useSession } from "next-auth/react";
import usePost from "@hook/usePost";


const TopicActions: React.FC<{ likes: number; postId: string, ownerId: string; }> = ({ postId, ownerId, likes }) => {
    const { unlike, like, report, delete: deletePost, likes: data, isLoading } = usePost();
    const session = useSession();

    if (session.status !== "authenticated") return null;

    return (
        <div className="p-0.5 flex justify-end gap-1 text-neutral-600">
            <button disabled={isLoading} data-headlessui-state={data?.likedByMe ? "active" : ""} onClick={() => data?.likedByMe ? unlike("post", postId) : like("post", postId)} type="button" className="p-1 flex hover:text-black ui-active:text-red-400 ui-active:hover:text-red-500 disabled:text-neutral-800" title="like this post">
                {data?.likesCount ?? likes > 0 ? (
                    <span className="mr-1">{data?.likesCount ?? likes}</span>
                ) : null}
                <HiHeart className="h-6 w-6" />
            </button>
            <button onClick={() => report("post", postId)} type="button" className="p-1 flex hover:text-black" title="privately flag this post for attention or send a private notification about it">
                <HiFlag className="h-6 w-6" />
            </button>
            {session.data?.user.id === ownerId ? (
                <button title="delete your post"
                    className="p-1 text-red-500 hover:text-red-700"
                    onClick={() => deletePost("post", postId)}
                >
                    <HiTrash className="h-6 w-6" />
                </button>
            ) : null}
        </div>
    )
}

export default TopicActions;