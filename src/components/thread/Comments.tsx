import { useSession, signIn } from "next-auth/react";
import dynamic from "next/dynamic";
import { useState } from "react";
import useSWR from "swr";

import Comment, { type TComment } from "@components/thread/Comment";
import { isEditorEmpty, resetEditor } from "@/lib/utils/editor/editorActions";
import usePostActions from "@hook/usePostActions";
import type { Paginate } from "@type/page";
import { Descendant } from "slate";

type Props = {
  post: string;
}

const TextEditor = dynamic(() => import("@components/community/editor/TextEditor"), {
  loading: () => (
    <div className="animate-pulse">
      <span className="inline-block h-12 w-full flex-auto cursor-wait bg-current align-middle text-base text-neutral-700 opacity-50"></span>
      <span className="inline-block h-28 w-full flex-auto cursor-wait bg-current align-middle text-base text-neutral-700 opacity-50"></span>
    </div>
  )
});

const Comments: React.FC<Props> = ({ post }) => {
  const [state, setState] = useState<Descendant[]>([{ type: "paragraph", children: [{ text: "" }] }]);
  const session = useSession();
  const actions = usePostActions();
  const [page, setPage] = useState(1);
  const { data, isLoading, error, mutate } = useSWR<
    Paginate<TComment>,
    Response,
    string
  >(
    `/api/community/comments?post=${post}&page=${page}`,
    (url) =>
      fetch(url)
        .then((value) => {
          if (value.ok) return value;
          throw value;
        })
        .then((res) => res.json()) as Promise<Paginate<TComment>>
  );

  const deleteComment = async (id: string) => {
    try {
      if (!data) return;
      await actions.delete("comment", id);
      await mutate({
        ...data,
        result: data.result.filter((value) => value.id !== id),
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateComment = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    try {
      if (!data || !state) return;

      const empty = await isEditorEmpty()
      if (empty) return;

      const result = await actions.create("comment", { data: state, id: post });
      if (!result) return;

      resetEditor();

      await mutate({ ...data, result: [result, ...data.result] });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="my-4">
      {session.status === "authenticated" ? (
        <form
          className="my-6 flex flex-col justify-evenly gap-1 md:px-4"
          onSubmit={handleCreateComment}
        >
          <TextEditor value={state} onChange={setState} />
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
        <div>
          Comments
        </div>
        <div>
          <label htmlFor="sort">Sort By</label>
          <select id="sort" className="border-none focus:outline-none focus:ring-0">
            <option>Latest</option>
            <option>Oldest</option>
            <option>Top</option>
          </select>
        </div>
      </div>
      <hr className="border-b-2" />
      <ul className="mt-5 w-full divide-y">
        {error || !data ? (
          <li className="text-center py-4 font-bold text-lg">{error?.statusText ?? "Failed to load comments"}</li>
        ) : null}
        {isLoading ? (
          <li className="animate-pulse">
            <span className="inline-block h-12 w-full flex-auto cursor-wait bg-current align-middle text-base text-neutral-700 opacity-50"></span>
            <span className="inline-block h-28 w-full flex-auto cursor-wait bg-current align-middle text-base text-neutral-700 opacity-50"></span>
          </li>
        ) : null}
        {!isLoading && data && !data?.result?.length ? (
          <li className="text-center py-4 font-bold text-lg">No comments yet.</li>
        ) : null}
        {!isLoading && data
          ? data?.result.map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              session={session}
              deleteComment={deleteComment}
            />
          ))
          : null}
      </ul>
      <div className="mt-5 flex items-center justify-evenly">
        <button
          onClick={() => setPage(data?.previousPage ?? 1)}
          disabled={isLoading || data?.isFirstPage}
          type="button"
          className="inline-block rounded-sm bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] disabled:pointer-events-none disabled:opacity-70"
        >
          Prev
        </button>

        <div>
          {data?.currentPage ?? 0} of {(data?.pageCount ?? 0) + 1}
        </div>

        <button
          onClick={() => setPage(data?.nextPage ?? 1)}
          disabled={isLoading || data?.isLastPage}
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
