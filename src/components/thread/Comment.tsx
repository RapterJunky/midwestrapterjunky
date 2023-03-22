import type { User, Comment } from "@api/prisma";
import type { useSession } from "next-auth/react";
import Image from "next/image";
import { HiFlag, HiTrash } from "react-icons/hi";
import { formatLocalDate } from "@lib/utils/timeFormat";

type Session = ReturnType<typeof useSession>;
export type TComment = Omit<Comment, "ownerId" | "threadPostId"> & {
  owner: Omit<User, "email" | "emailVerified">;
};

interface Props {
  comment: TComment;
  session: Session;
  handleEdit?: (ev: React.FormEvent<HTMLFormElement>) => Promise<void>;
  handleCreate?: (ev: React.FormEvent<HTMLFormElement>) => Promise<void>;
  deleteComment: (id: string) => Promise<void>;
  reportComment: (id: string) => Promise<void>;
}

/**
 *  Implement Handles for edits and reply another time.
 *
 */
const Comment: React.FC<Props> = ({
  deleteComment,
  reportComment,
  comment,
  session,
}) => {
  return (
    <li
      className={`flex w-full flex-col gap-2 py-2 ${
        comment.parentCommentId ? " ml-11 border-l-2 border-gray-300 pl-2" : ""
      }`}
    >
      <div className="flex w-full gap-4">
        <div>
          <Image
            width={40}
            height={40}
            className="rounded-full"
            src={comment.owner.image ?? ""}
            alt="avatar"
          />
        </div>
        <div className="flex w-full flex-col gap-2">
          <div className="text-xs text-gray-500">
            {comment.owner.name} •{" "}
            {formatLocalDate(comment.created, "en-us", { weekday: "short" })}
          </div>
          <article className="line prose max-w-none">
            {comment.content?.message ?? "Missing comment message!"}
          </article>
          <div className="flex items-center gap-2 text-gray-500">
            {session.status === "authenticated" ? (
              <>
                <button
                  className="flex items-center gap-1 text-xs hover:text-gray-700"
                  onClick={() => reportComment(comment.id)}
                >
                  <HiFlag />
                  Report
                </button>
                {session.data?.user.id === comment.owner.id ? (
                  <>
                    •
                    <button
                      className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
                      onClick={() => deleteComment(comment.id)}
                    >
                      <HiTrash />
                      Delete
                    </button>
                  </>
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