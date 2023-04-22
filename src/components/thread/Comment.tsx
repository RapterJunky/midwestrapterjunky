import { StructuredText } from "react-datocms/structured-text";
import { HiFlag, HiHeart, HiTrash } from "react-icons/hi";
import type { useSession } from "next-auth/react";
import { useState } from 'react';
import Image from "next/image";

import type { User, Comment as DbComment } from "@api/prisma";
import { formatLocalDate } from "@lib/utils/timeFormat";
import { renderBlock } from "@lib/structuredTextRules";
import usePostActions from "@hook/usePost";

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
  const [loading, setLoading] = useState({ state: false, type: "" });
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
              <StructuredText renderBlock={renderBlock} data={comment.content} />
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
                <button disabled={loading.state && loading.type === "report"}
                  title="privately flag this comment for attention or send a private notification about it"
                  className="hover:text-black p-0.5 flex items-center disabled:opacity-70"
                  onClick={async () => {
                    setLoading({ state: true, type: "report" });
                    await report("comment", comment.id);
                    setLoading({ state: false, type: "" });
                  }}
                >
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
                {/*<button className="hover:text-black p-0.5">
                  <HiLink className="h-6 w-6" />
                </button>*/}
                {session.data?.user.id === comment.owner.id ? (
                  <button disabled={loading.state && loading.type === "delete"} title="delete your comment"
                    className="p-0.5 text-red-500 hover:text-red-700 flex items-center disabled:opacity-70"
                    onClick={async () => {
                      setLoading({ state: true, type: "delete" });
                      await deleteComment("comment", comment.id);
                      setLoading({ state: false, type: "" });
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
              </>
            ) : null}
          </div>
        </div>
      </div>
    </li>
  );
};

export default Comment;
