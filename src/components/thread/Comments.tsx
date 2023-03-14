import useSWR from 'swr';
import Image from 'next/image';
import { useState } from 'react';
import { useSession, signIn } from "next-auth/react"
import { HiArrowCircleRight } from "react-icons/hi";
import type { Paginate } from "@type/page";
import Comment, { type TComment } from './Comment';
interface Props {
    post: string;
}

const Comments: React.FC<Props> = ({ post }) => {
    const session = useSession();
    const [page, setPage] = useState(1);
    const { data, isLoading, error, mutate } = useSWR<Paginate<TComment>, Response>(`/api/threads/comments?post=${post}&page=${page}`, (url) => fetch(url).then(value => { if (value.ok) return value; throw value; }).then(res => res.json()));

    const deleteComment = async (id: string) => {
        try {
            if (!data) return;
            const request = await fetch("/api/threads/comments", {
                method: "DELETE",
                body: JSON.stringify({ id }),
                headers: {
                    "Content-Type": "application/json"
                }
            });
            if (!request.ok) throw new Error();

            await mutate({ ...data, result: data.result.filter(value => value.id !== id) });
        } catch (error) {
            console.error(error);
        }
    }

    const reportComment = async (id: string) => {
        try {
            const request = await fetch("/api/threads/comments", {
                method: "POST",
                body: JSON.stringify({
                    id
                }),
                headers: {
                    "Content-Type": "application/json",
                    "X-Comment-Report": "true"
                }
            });
            if (!request.ok) throw new Error();
        } catch (error) {
            console.error(error);
        }
    }

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
                        message: formData.get("comment") ?? "Placeholder text"
                    }
                }),
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (!result.ok) throw new Error();
            const content = await result.json();

            await mutate({ ...data, result: [...data.result, content] });
        } catch (error) {
            console.error(error);
        }
    }

    const handleEdit = async (ev: React.FormEvent<HTMLFormElement>) => {
        try {

        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className="my-4 mx-4">
            {session.status === "authenticated" ? (
                <form className="flex justify-evenly gap-2 mt-6" onSubmit={handleCreateComment}>
                    <Image width={52} height={52} className="rounded-full" src={session.data.user?.image ?? "https://api.dicebear.com/5.x/icons/png?seed=Question"} alt="avatar" />
                    <input autoComplete="off" name="comment" className="mt-0 block w-full px-0.5 border-0 border-b-2 border-gray-200 focus:ring-0 focus:border-black" type="text" placeholder="Add a comment" />
                    <button type="submit" className='px-1'>
                        <HiArrowCircleRight className="h-10 w-10 text-blue-400 hover:text-blue-500" />
                    </button>
                </form>
            ) : (
                <div className="flex gap-4 mt-6 justify-center w-full">
                    <span>Login to comment</span> •
                    <button className="underline" onClick={() => signIn()}>Login</button>
                </div>
            )}
            <div className="mt-5">{data?.result.length} Comments</div>
            <ul className="mt-5 w-full">
                {error || !data ? (<li>{error?.statusText ?? "Failed to load comments"}</li>) : null}
                {isLoading ? (<li>Loading</li>) : null}
                {!isLoading && data && !data?.result?.length ? (<li>No Comments</li>) : null}
                {!isLoading && data ? data?.result.map((comment) => (
                    <Comment key={comment.id} comment={comment} session={session} handleEdit={handleEdit} handleCreate={handleCreateComment} deleteComment={deleteComment} reportComment={reportComment} />
                )) : null}
            </ul>
            <div className='flex items-center justify-evenly mt-5'>
                <button onClick={() => setPage(data?.previousPage ?? 1)} disabled={isLoading || data?.isFirstPage} type="button" className="disabled:pointer-events-none disabled:opacity-70 inline-block rounded bg-primary px-6 pt-2.5 pb-2 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)]">
                    Prev
                </button>

                <div>{data?.currentPage ?? 0} of {data?.currentPage ?? 0}</div>

                <button onClick={() => setPage(data?.nextPage ?? 1)} disabled={isLoading || data?.isLastPage} type="button" className="disabled:pointer-events-none disabled:opacity-70 inline-block rounded bg-primary px-6 pt-2.5 pb-2 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)]">
                    Next
                </button>
            </div>
        </div>
    );
}

export default Comments;