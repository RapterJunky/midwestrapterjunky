import { HiFlag, HiHeart, HiTrash } from "react-icons/hi";
import { useSession } from "next-auth/react";
import { useState } from 'react';
import usePost from "@hook/usePost";


const TopicActions: React.FC<{ likes: number; postId: string, ownerId: string; }> = ({ postId, ownerId, likes }) => {
    const { unlike, like, report, delete: deletePost, likes: data, isLoading } = usePost();
    const [loading, setLoading] = useState({ state: false, type: "" });
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
            <button onClick={async () => {
                setLoading({ state: true, type: "report" });
                await report("post", postId);
                setLoading({ state: false, type: "" });
            }} type="button" className="p-1 hover:text-black flex items-center gap-1" title="privately flag this post for attention or send a private notification about it">
                {loading.state && loading.type === "report" ? (
                    <div className="flex gap-2">
                        <div
                            className="inline-block h-4 w-4 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                            role="status">
                            <span
                                className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
                            >Loading...</span
                            >
                        </div>
                    </div>
                ) : null}
                <HiFlag className="h-6 w-6" />
            </button>
            {session.data?.user.id === ownerId ? (
                <button title="delete your post"
                    className="p-1 text-red-500 hover:text-red-700 flex items-center gap-1"
                    onClick={async () => {
                        setLoading({ state: true, type: "delete" })
                        await deletePost("post", postId);
                        setLoading({ state: false, type: "" })
                    }}
                >
                    {loading.state && loading.type === "delete" ? (
                        <div className="flex gap-2">
                            <div
                                className="inline-block h-4 w-4 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                                role="status">
                                <span
                                    className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
                                >Loading...</span
                                >
                            </div>
                        </div>
                    ) : null}
                    <HiTrash className="h-6 w-6" />
                </button>
            ) : null}
        </div>
    )
}

export default TopicActions;