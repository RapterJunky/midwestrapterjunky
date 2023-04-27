import { StructuredText } from "react-datocms/structured-text";
import type { useSession } from "next-auth/react";
//import dynamic from 'next/dynamic';
import { useState } from "react";
import Image from "next/image";

import usePost /*, { type CreateCommentBody }*/ from "@hook/usePost";
import type { User, Comment as DbComment } from "@api/prisma";
import { formatLocalDate } from "@lib/utils/timeFormat";
import { renderBlock } from "@lib/structuredTextRules";
import HiHeart from "@components/icons/HiHeart";
import HiTrash from "@components/icons/HiTrash";
import HiFlag from "@components/icons/HiFlag";
import Spinner from "@components/Spinner";
//import useComment from "@/hooks/useComment";

type Session = ReturnType<typeof useSession>;
export type TComment = Omit<DbComment, "ownerId" | "threadPostId"> & {
  owner: Omit<User, "email" | "emailVerified">;
  likedByMe: boolean;
  likeCount: number;
  children: number;
};

interface Props {
  comment: TComment;
  session: Session;
  isChild?: boolean;
}

/*const ChildComments = dynamic(() => import("@components/thread/ChildComments"));
const CommentBox = dynamic(() => import("@components/thread/CommentBox"), {
  loading: () => (
    <div className="animate-pulse">
      <span className="inline-block h-12 w-full flex-auto cursor-wait bg-current align-middle text-base text-neutral-700 opacity-50"></span>
      <span className="inline-block h-28 w-full flex-auto cursor-wait bg-current align-middle text-base text-neutral-700 opacity-50"></span>
    </div>
  )
});*/

const Comment: React.FC<Props> = ({
  comment,
  session,
  //isChild = false
}) => {
  //const [showReplies, setShowReplies] = useState(false);
  //const [showReplyBox, setShowReplyBox] = useState(false);
  const [loading, setLoading] = useState({ state: false, type: "" });
  const { report, like, unlike, delete: deleteComment } = usePost();
  return (
    <li
      id={comment.id}
      className="flex w-full flex-col gap-2 py-2 animate-in fade-in-10"
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
          <div className="mb-1 flex justify-between text-neutral-600">
            <div className="font-bold">{comment.owner.name}</div>
            <div>
              {formatLocalDate(comment.created, undefined, {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </div>
          </div>
          <article className="prose min-h-[50px] max-w-none">
            {comment.content ? (
              <StructuredText
                renderBlock={renderBlock}
                data={comment.content}
              />
            ) : (
              "Missing comment message!"
            )}
          </article>
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              {/*session.status === "authenticated" && !isChild ? (
                <button onClick={() => setShowReplyBox(curr => !curr)} className="hover:text-black p-1 text-gray-500 hover:bg-gray-400 hover:bg-opacity-20 rounded-sm" title="reply to comment" aria-label="reply">
                  <HiReply className="h-5 w-5" />
                </button>
              ) : null*/}
              {/*comment.children > 0 ? (
                <button className="flex items-center text-gray-600 hover:text-black hover:bg-gray-400 hover:bg-opacity-20 p-1 rounded-sm" onClick={() => setShowReplies((curr) => !curr)}>
                  <span>{comment.children} {comment.children === 1 ? "Reply" : "Replies"}</span>
                  {showReplies ? (<HiChevronDown className="h-6 w-6" />) : (<HiChevronUp className="h-6 w-6" />)}
                </button>
              ) : null*/}
            </div>
            <div className="flex items-center justify-end gap-1 text-gray-500">
              <button
                disabled={session.status !== "authenticated"}
                title="like this comment"
                data-headlessui-state={comment.likedByMe ? "active" : ""}
                onClick={() =>
                  comment.likedByMe
                    ? unlike("comment", comment.id)
                    : like("comment", comment.id)
                }
                className="flex rounded-sm p-1 hover:bg-gray-400 hover:bg-opacity-20 hover:text-black ui-active:text-red-400"
              >
                {comment.likeCount > 0 ? (
                  <span className="mr-1">{comment.likeCount}</span>
                ) : null}
                <HiHeart className="h-6 w-6" />
              </button>
              {session.status === "authenticated" ? (
                <>
                  <button
                    disabled={loading.state && loading.type === "report"}
                    title="privately flag this comment for attention or send a private notification about it"
                    className="flex items-center rounded-sm p-1 hover:bg-gray-400 hover:bg-opacity-20 hover:text-black disabled:opacity-70"
                    onClick={async () => {
                      setLoading({ state: true, type: "report" });
                      await report("comment", comment.id);
                      setLoading({ state: false, type: "" });
                    }}
                  >
                    {loading.state && loading.type === "report" ? (
                      <div className="flex gap-2">
                        <Spinner />
                      </div>
                    ) : null}
                    <HiFlag className="h-6 w-6" />
                  </button>
                  {session.data?.user.id === comment.owner.id ? (
                    <button
                      disabled={loading.state && loading.type === "delete"}
                      title="delete your comment"
                      className="flex items-center rounded-sm p-1 text-red-500 hover:bg-gray-400 hover:bg-opacity-20 hover:text-red-700 disabled:opacity-70"
                      onClick={async () => {
                        setLoading({ state: true, type: "delete" });
                        await deleteComment("comment", comment.id);
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
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      {/*showReplyBox ? (
        <div className="pl-6">
          <hr />
          <CommentBox create={async (content: CreateCommentBody) => {
            await create({ message: content.message, parentCommentId: comment.id });
            setShowReplyBox(false);
          }} />
        </div>
        ) : null*/}
      {/*showReplies ? (
        <>
          <hr />
          <ChildComments session={session} parentId={comment.id} postId={postId} />
        </>
      ) : null*/}
    </li>
  );
};

export default Comment;
