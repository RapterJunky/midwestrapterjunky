import { useSession, signIn } from "next-auth/react";
import dynamic from "next/dynamic";

import Comment from "@components/thread/Comment";
import SkeletonComment from "./SkeletonComment";
import usePost from "@hook/usePost";

const CommentBox = dynamic(() => import("@components/thread/CommentBox"), {
  loading: () => (
    <div className="animate-pulse">
      <span className="inline-block h-12 w-full flex-auto cursor-wait bg-current align-middle text-base text-neutral-700 opacity-50"></span>
      <span className="inline-block h-28 w-full flex-auto cursor-wait bg-current align-middle text-base text-neutral-700 opacity-50"></span>
    </div>
  ),
});

const Comments: React.FC = () => {
  const { isLoading, comments, error, setPage, create } = usePost();
  const session = useSession();

  return (
    <div className="my-4">
      {session.status === "authenticated" ? (
        <CommentBox submit={create} />
      ) : (
        <div className="mt-6 flex w-full justify-center gap-4">
          <span>Login to comment</span> •
          <button className="underline" onClick={() => signIn()}>
            Login
          </button>
        </div>
      )}
      <div className="mb-2 flex items-center justify-between">
        <div className="p-1">Comments</div>
      </div>
      <hr className="border-b-2" />
      <ul className="mt-5 w-full divide-y">
        {!isLoading && (error || !comments) ? (
          <li className="py-4 text-center text-lg font-bold">
            {error?.statusText ?? "Failed to load comments"}
          </li>
        ) : null}
        {isLoading ? (
          <>
            <SkeletonComment />
            <SkeletonComment />
            <SkeletonComment />
          </>
        ) : null}
        {!isLoading && comments && !comments?.result?.length ? (
          <li className="py-4 text-center text-lg font-bold">
            No comments yet.
          </li>
        ) : null}
        {!isLoading && comments
          ? comments?.result.map((comment) => (
            <Comment key={comment.id} comment={comment} session={session} />
          ))
          : null}
      </ul>
      <div className="mt-5 flex items-center justify-evenly">
        <button
          onClick={() => setPage(comments?.previousPage ?? 1)}
          disabled={isLoading || comments?.isFirstPage}
          type="button"
          className="inline-block rounded-sm bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] disabled:pointer-events-none disabled:opacity-70"
        >
          Prev
        </button>

        <div>
          {comments?.currentPage ?? 1} of {(comments?.pageCount ?? 0) + 1}
        </div>

        <button
          onClick={() => setPage(comments?.nextPage ?? 1)}
          disabled={isLoading || comments?.isLastPage}
          type="button"
          className="inline-block rounded-sm bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] disabled:pointer-events-none disabled:opacity-70"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Comments;
