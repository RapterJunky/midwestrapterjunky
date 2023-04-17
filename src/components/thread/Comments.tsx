import useSWR from "swr";
import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { HiLink } from "react-icons/hi";
import type { Paginate } from "@type/page";
import Comment, { type TComment } from "./Comment";
import { FaBold, FaFileImage, FaHighlighter, FaItalic, FaListOl, FaListUl } from "react-icons/fa";
import TextEditor from "../community/editor/TextEditor";

type Props = {
  post: string;
}

const Comments: React.FC<Props> = ({ post }) => {
  const session = useSession();
  const [page, setPage] = useState(1);
  const { data, isLoading, error, mutate } = useSWR<
    Paginate<TComment>,
    Response,
    string
  >(
    `/api/threads/comments?post=${post}&page=${page}`,
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
      const request = await fetch("/api/threads/comments", {
        method: "DELETE",
        body: JSON.stringify({ id }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!request.ok) throw request;

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
      if (!data) return;
      const formData = new FormData(ev.target as HTMLFormElement);

      (ev.target as HTMLFormElement).reset();

      const result = await fetch("/api/threads/comments", {
        method: "POST",
        body: JSON.stringify({
          threadPostId: post,
          content: {
            message: formData.get("comment") ?? "Placeholder text",
          },
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!result.ok) throw result;
      const content = (await result.json()) as TComment;

      await mutate({ ...data, result: [...data.result, content] });
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
          <TextEditor />
          {/*<textarea
            autoComplete="off"
            name="comment"
            className="border border-neutral-400 rounded-sm"
            placeholder="Add a comment"
      />*/}
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
            <option>Likes</option>
          </select>
        </div>
      </div>
      <hr className="border-b-2" />
      <ul className="mt-5 w-full divide-y">
        {error || !data ? (
          <li>{error?.statusText ?? "Failed to load comments"}</li>
        ) : null}
        {isLoading ? <li>Loading</li> : null}
        {!isLoading && data && !data?.result?.length ? (
          <li className="text-center">No comments yet.</li>
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
          {data?.currentPage ?? 0} of {data?.currentPage ?? 0}
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
