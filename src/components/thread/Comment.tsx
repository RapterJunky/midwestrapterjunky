import type { useSession } from "next-auth/react";
import { HiFlag, HiHeart, HiTrash } from "react-icons/hi";
import Image from "next/image";

import type { User, Comment as DbComment } from "@api/prisma";
import { formatLocalDate } from "@lib/utils/timeFormat";
import usePostActions from "@/hooks/usePost";
import { StructuredText } from "react-datocms/structured-text";

type Session = ReturnType<typeof useSession>;
export type TComment = Omit<DbComment, "ownerId" | "threadPostId"> & {
  owner: Omit<User, "email" | "emailVerified">,
  likedByMe: boolean;
  likeCount: number;
};

interface Props {
  comment: TComment;
  session: Session;
}

/**
 *  Implement Handles for edits and reply another time.
 *
 */
const Comment: React.FC<Props> = ({
  comment,
  session,
}) => {
  const { report, like, unlike, delete: deleteComment } = usePostActions();
  return (
    <li id={comment.id}
      className={`flex w-full flex-col gap-2 py-2 ${comment.parentCommentId ? " ml-11 border-l-2 border-gray-300 pl-2" : ""
        }`}
    >
      <div className="flex w-full">
        <div>
          <Image
            width={40}
            height={40}
            className="rounded-full"
            src={comment.owner.image ?? ""}
            alt="avatar"
          />
        </div>
        <div className="flex w-full flex-col px-2">
          <div className="text-neutral-600 flex justify-between mb-1">
            <div className="font-bold">
              {comment.owner.name}
            </div>
            <div>
              {formatLocalDate(comment.created, undefined, { day: "numeric", month: "short", year: "numeric" })}
            </div>
          </div>
          <article className="prose max-w-none min-h-[50px]">
            {comment.content ? (
              <StructuredText data={comment.content} />
            ) : "Missing comment message!"}
          </article>
          <div className="flex items-center gap-2 text-gray-500 justify-end p-2">
            {session.status === "authenticated" ? (
              <>
                <button title="like this comment" data-headlessui-state={comment.likedByMe ? "active" : ""} onClick={() => comment.likedByMe ? unlike("comment", comment.id) : like("comment", comment.id)} className="flex hover:text-black p-0.5 ui-active:text-red-400">
                  {comment.likeCount > 0 ? (
                    <span className="mr-1">{comment.likeCount}</span>
                  ) : null}
                  <HiHeart className="h-6 w-6" />
                </button>
                <button
                  title="privately flag this comment for attention or send a private notification about it"
                  className="hover:text-black p-0.5"
                  onClick={() => report("comment", comment.id)}
                >
                  <HiFlag className="h-6 w-6" />
                </button>
                {/*<button className="hover:text-black p-0.5">
                  <HiLink className="h-6 w-6" />
                </button>*/}
                {session.data?.user.id === comment.owner.id ? (
                  <button title="delete your comment"
                    className="p-0.5 text-red-500 hover:text-red-700"
                    onClick={() => deleteComment("comment", comment.id)}
                  >
                    <HiTrash className="h-6 w-6" />
                  </button>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
      </div>
    </li>
  );
};

export default Comment;
