import type { User, Comment as DbComment } from "@api/prisma";
import type { useSession } from "next-auth/react";
import Image from "next/image";
import { HiFlag, HiHeart, HiLink, HiTrash } from "react-icons/hi";
import { formatLocalDate } from "@lib/utils/timeFormat";

type Session = ReturnType<typeof useSession>;
export type TComment = Omit<DbComment, "ownerId" | "threadPostId"> & {
  owner: Omit<User, "email" | "emailVerified">;
};

interface Props {
  comment: TComment;
  session: Session;
  handleEdit?: (ev: React.FormEvent<HTMLFormElement>) => Promise<void>;
  handleCreate?: (ev: React.FormEvent<HTMLFormElement>) => Promise<void>;
  deleteComment: (id: string) => Promise<void>;
  reportComment: (id: string) => void;
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
      className={`flex w-full flex-col gap-2 py-2 ${comment.parentCommentId ? " ml-11 border-l-2 border-gray-300 pl-2" : ""
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
          <div className="text-neutral-600 flex justify-between mb-4">
            <div className="font-bold">
              {comment.owner.name}
            </div>
            <div>
              {formatLocalDate(comment.created, undefined, { day: "numeric", month: "short", year: "numeric" })}
            </div>
          </div>
          <article className="prose max-w-none min-h-[100px]">
            {comment.content?.message ?? "Missing comment message!"}
          </article>
          <div className="flex items-center gap-4 text-gray-500 justify-end p-2">
            {session.status === "authenticated" ? (
              <>
                <button className="hover:text-gray-900 p-0.5">
                  <HiHeart className="h-6 w-6" />
                </button>
                <button
                  className="hover:text-gray-900 p-0.5"
                  onClick={() => reportComment(comment.id)}
                >
                  <HiFlag className="h-6 w-6" />
                </button>
                <button className="hover:text-gray-900 p-0.5">
                  <HiLink className="h-6 w-6" />
                </button>
                {session.data?.user.id === comment.owner.id ? (
                  <button
                    className="p-0.5 text-red-500 hover:text-red-700"
                    onClick={() => deleteComment(comment.id)}
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
