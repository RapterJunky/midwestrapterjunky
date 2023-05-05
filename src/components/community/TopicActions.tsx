import { useSession } from "next-auth/react";
import { useState } from "react";

import HiTrash from "@components/icons/HiTrash";
import HiHeart from "@components/icons/HiHeart";
import HiFlag from "@components/icons/HiFlag";
import Spinner from "@/components/ui/Spinner";
import usePost from "@hook/usePost";
import Link from "next/link";
import { HiPencil } from "react-icons/hi";

const TopicActions: React.FC<{
  likes: number;
  postId: string;
  ownerId: string;
}> = ({ postId, ownerId, likes }) => {
  const {
    unlike,
    like,
    report,
    delete: deletePost,
    likes: data,
    isLoading,
  } = usePost();
  const [loading, setLoading] = useState({ state: false, type: "" });
  const session = useSession();

  if (session.status !== "authenticated")
    return (
      <div className="flex justify-end gap-1 p-0.5 text-neutral-600">
        <button
          type="button"
          className="flex rounded-sm p-1 hover:bg-gray-400 hover:bg-opacity-20 hover:text-black disabled:text-neutral-800 ui-active:text-red-400 ui-active:hover:text-red-500"
          title="like this post"
        >
          {data?.likesCount ?? likes > 0 ? (
            <span className="mr-1">{data?.likesCount ?? likes}</span>
          ) : null}
          <HiHeart className="h-6 w-6" />
        </button>
      </div>
    );

  return (
    <div className="flex justify-end gap-1 p-0.5 text-neutral-600">
      {session.data?.user.id === ownerId ? (
        <Link title="Edit Post" className="mr-auto flex rounded-sm p-1 hover:bg-gray-400 hover:bg-opacity-20 hover:text-black disabled:text-neutral-800 ui-active:text-red-400 ui-active:hover:text-red-500" href={{ pathname: "/community/create-topic", query: { edit: postId } }}>
          <HiPencil className="h-6 w-6" />
        </Link>
      ) : null}

      <button
        disabled={isLoading}
        data-headlessui-state={data?.likedByMe ? "active" : ""}
        onClick={() =>
          data?.likedByMe ? unlike("post", postId) : like("post", postId)
        }
        type="button"
        className="flex rounded-sm p-1 hover:bg-gray-400 hover:bg-opacity-20 hover:text-black disabled:text-neutral-800 ui-active:text-red-400 ui-active:hover:text-red-500"
        title="like this post"
      >
        {data?.likesCount ?? likes > 0 ? (
          <span className="mr-1">{data?.likesCount ?? likes}</span>
        ) : null}
        <HiHeart className="h-6 w-6" />
      </button>
      <button
        onClick={async () => {
          setLoading({ state: true, type: "report" });
          await report("post", postId);
          setLoading({ state: false, type: "" });
        }}
        type="button"
        className="flex items-center gap-1 rounded-sm p-1 hover:bg-gray-400 hover:bg-opacity-20 hover:text-black"
        title="privately flag this post for attention or send a private notification about it"
      >
        {loading.state && loading.type === "report" ? (
          <div className="flex gap-2">
            <Spinner />
          </div>
        ) : null}
        <HiFlag className="h-6 w-6" />
      </button>
      {session.data?.user.id === ownerId ? (
        <button
          title="delete your post"
          className="flex items-center gap-1 rounded-sm p-1 text-red-500 hover:bg-gray-400 hover:bg-opacity-20 hover:text-red-700"
          onClick={async () => {
            setLoading({ state: true, type: "delete" });
            await deletePost("post", postId);
            setLoading({ state: false, type: "" });
          }}
        >
          {loading.state && loading.type === "delete" ? (
            <div className="flex gap-2">
              <Spinner />
            </div>
          ) : null}
          <HiTrash className="h-6 w-6" />
        </button>
      ) : null}
    </div>
  );
};

export default TopicActions;
