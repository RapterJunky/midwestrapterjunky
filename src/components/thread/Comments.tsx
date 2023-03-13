import useSWR from 'swr';
import { useSession, signIn } from "next-auth/react"
import { HiArrowCircleRight, HiDotsHorizontal, HiReply } from "react-icons/hi";
import { User, Comment } from "@api/prisma";
import type { Paginate } from "@type/page";
import { useState } from 'react';
import { formatLocalDate } from '@lib/utils/timeFormat';

type PostComments = Paginate<Omit<Comment, "ownerId" | "threadPostId"> & { owner: Omit<User, "email" | "emailVerified"> }>

interface Props {
    post: string;
}

const Comments: React.FC<Props> = ({ post }) => {
    const session = useSession();
    const [page, setPage] = useState(1);
    const { data, isLoading, error, mutate } = useSWR<PostComments, Response>(`/api/threads/comments?post=${post}&page=${page}`, (url) => fetch(url).then(value => { if (value.ok) return value; throw value; }).then(res => res.json()));

    return (
        <div className="my-4">
            <span>{data?.result.length} Comments</span>
            {session.status === "authenticated" ? (
                <form className="flex gap-4 mt-6">
                    <div>
                        <img className="rounded-full w-16" src={`https://api.dicebear.com/5.x/icons/png?seed=${"SomeData"}`} alt="avatar" />
                    </div>
                    <input className="mt-0 block w-full px-0.5 border-0 border-b-2 border-gray-200 focus:ring-0 focus:border-black" type="text" placeholder="Add a comment" />
                    <button type="submit" className='px-2'>
                        <HiArrowCircleRight className="h-10 w-10" />
                    </button>
                </form>
            ) : (
                <div className="flex gap-4 mt-6 justify-center w-full">
                    <span>Login to comment</span> •
                    <button className="underline" onClick={() => signIn()}>Login</button>
                </div>
            )}
            <ul className="mt-5">
                {error || !data ? (<li>{error?.statusText ?? "Failed to load comments"}</li>) : null}
                {isLoading ? (<li>Loading</li>) : null}
                {!isLoading && data && !data?.result?.length ? (<li>No Comments</li>) : null}
                {!isLoading && data ? data?.result.map((comment) => (
                    <li key={comment.id} className={`flex gap-4 py-2 ${comment.parentCommentId ? " ml-11 border-l-2 border-gray-300 pl-2" : ""}`}>
                        <div>
                            <img className="rounded-full w-16" src={`https://api.dicebear.com/5.x/icons/png?seed=${"SomeData"}`} alt="avatar" />
                        </div>
                        <div className='flex flex-col gap-2'>
                            <div className="text-xs text-gray-500">{comment.owner.name} • {formatLocalDate(comment.created, "en-us", { weekday: "short" })}</div>
                            <article className='prose max-w-none'>
                                Lorem ipsum dolor sit amet consectetur adipisicing elit. Iusto molestiae sit quaerat illum impedit, unde earum aut voluptatem tempore! Eveniet minima iste vitae rerum eos, tempora expedita quo consectetur tenetur!
                            </article>
                            <div className="flex gap-2 items-center text-gray-500">
                                <button className='text-xs flex gap-1 items-center'>
                                    <HiReply /> Reply
                                </button>
                                •
                                {session.data?.user.id === comment.owner.id ? (
                                    <>
                                        <button className='text-xs flex gap-1 items-center'>
                                            Edit
                                        </button> •
                                    </>
                                ) : null}
                                <button>
                                    <HiDotsHorizontal />
                                </button>
                            </div>
                        </div>
                        <div></div>
                    </li>
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