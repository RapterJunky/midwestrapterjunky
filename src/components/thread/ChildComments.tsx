//import type { NonTextNode } from "datocms-structured-text-slate-utils";
import type { useSession } from "next-auth/react";
import { useState } from 'react';
import useSWR from 'swr';

//import extractSlateImages from "@lib/utils/editor/extractSlateImages";
import Comment, { type TComment } from "./Comment";
import { CommentCtx } from "@hook/useComment";
import { singleFetch } from '@api/fetch';
import { Paginate } from "@type/page";

type Session = ReturnType<typeof useSession>;
type Props = {
    postId: string;
    parentId: string;
    session: Session
}


const ChildComments: React.FC<Props> = ({ postId, parentId, session }) => {
    const [page, setPage] = useState<number>(1);
    const { data, isLoading, error, mutate } = useSWR<Paginate<TComment>, Response>(`/api/community/comments?post=${postId}&page=${page}&parent=${parentId}`, singleFetch as () => Promise<Paginate<TComment>>, {
        revalidateOnFocus: false
    });

    if (isLoading) {
        return (<div>Loading</div>);
    }

    if (error) {
        return (<div>Failed to load comments</div>);
    }

    if (data && !data.result.length) {
        return (<div>No Children</div>)
    }

    return (
        <CommentCtx.Provider value={{
            parentId,
            postId,
            async create(content) {


            }
        }}>
            <div className="pl-4 ml-6 mb-4">
                <ul className="divide-y w-full">
                    {isLoading ? (
                        <li>Loading</li>
                    ) : null}
                    {!isLoading && error ? (
                        <li>Failed to load comments</li>
                    ) : null}
                    {!isLoading && data ? !data.result.length ? (
                        <li>No Replies</li>
                    ) : data.result.map((comment, i) => (
                        <Comment isChild={true} comment={comment} session={session} key={i} />
                    )) : null}
                </ul>
                <hr />
                <div className="mt-5 flex items-center justify-evenly">
                    <button
                        onClick={() => setPage(1)}
                        disabled={isLoading || true}
                        type="button"
                        className="inline-block rounded-sm bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] disabled:pointer-events-none disabled:opacity-70"
                    >
                        Prev
                    </button>

                    <div>
                        {1} of {1}
                    </div>

                    <button
                        onClick={() => setPage(1)}
                        disabled={isLoading || true}
                        type="button"
                        className="inline-block rounded-sm bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] disabled:pointer-events-none disabled:opacity-70"
                    >
                        Next
                    </button>
                </div>
            </div>
        </CommentCtx.Provider>
    );
}

export default ChildComments;