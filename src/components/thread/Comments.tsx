import { useSession, signIn } from "next-auth/react";
import { useForm } from 'react-hook-form';
import type { Descendant } from "slate";

import { isEditorEmpty, resetEditor } from "@lib/utils/editor/editorActions";
import CommentBox from "@components/thread/CommentBox";
import Comment from "@components/thread/Comment";
import usePost from "@hook/usePost";

type FormState = {
  message: Descendant[];
}

const Comments: React.FC = () => {
  const { handleSubmit, control } = useForm<FormState>({
    defaultValues: {
      message: [{ type: "paragraph", children: [{ text: "" }] }]
    }
  });
  const { isLoading, comments, error, setPage, create } = usePost();
  const session = useSession();

  const onSubmit = async (state: FormState) => {
    const empty = await isEditorEmpty();
    if (empty) return;
    await create("comment", state);
    resetEditor();
  }

  return (
    <div className="my-4">
      {session.status === "authenticated" ? (
        <form className="my-6 flex flex-col justify-evenly gap-1 md:px-4" onSubmit={handleSubmit(onSubmit)}>
          <CommentBox control={control} name="message" />
          <div className="w-full flex justify-end">
            <button type="submit" className="inline-block rounded bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] disabled:pointer-events-none disabled:opacity-70">
              Reply
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-6 flex w-full justify-center gap-4">
          <span>Login to comment</span> •
          <button className="underline" onClick={() => signIn()}>
            Login
          </button>
        </div>
      )}
      <div className="mb-2 flex justify-between items-center">
        <div className="p-1">
          Comments
        </div>
      </div>
      <hr className="border-b-2" />
      <ul className="mt-5 w-full divide-y">
        {error || !comments ? (
          <li className="text-center py-4 font-bold text-lg">{error?.statusText ?? "Failed to load comments"}</li>
        ) : null}
        {isLoading ? (
          <li className="animate-pulse">
            <span className="inline-block h-12 w-full flex-auto cursor-wait bg-current align-middle text-base text-neutral-700 opacity-50"></span>
            <span className="inline-block h-28 w-full flex-auto cursor-wait bg-current align-middle text-base text-neutral-700 opacity-50"></span>
          </li>
        ) : null}
        {!isLoading && comments && !comments?.result?.length ? (
          <li className="text-center py-4 font-bold text-lg">No comments yet.</li>
        ) : null}
        {!isLoading && comments
          ? comments?.result.map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              session={session}
            />
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