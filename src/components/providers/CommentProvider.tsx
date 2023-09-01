"use client";
import useSWR, { type SWRResponse } from "swr";
import { createContext, useState } from "react";
import type { User, Comment } from "@prisma/client";
import type { Paginate } from "@/types/page";
import { fetcher } from "@/lib/api/fetcher";

export type TComment = Omit<Comment, "ownerId" | "threadPostId"> & {
    owner: Omit<User, "email" | "emailVerified">;
    likedByMe: boolean;
    likeCount: number;
    children: number;
};

type CommentContext = {
    comments: SWRResponse<Paginate<TComment>, Response, unknown>,
    nextPage: () => void,
    prevPage: () => void
}

export const commentContext = createContext<CommentContext | null>(null);

const CommentProvider: React.FC<React.PropsWithChildren<{ postId: string; }>> = ({ postId, children }) => {
    const [page, setPage] = useState(1);
    const comments = useSWR<Paginate<TComment>, Response, [string, string, number] | null>(postId ? ["/api/community/comments", postId, page] : null, ([url, id, pageNumber]) => fetcher(`${url}?post=${id}&page=${pageNumber}`),
        {
            revalidateOnFocus: false,
        },
    );

    return (
        <commentContext.Provider value={{
            comments,
            nextPage() {
                setPage(current => current + 1);
            },
            prevPage() {
                setPage(current => current - 1);
            }
        }}>
            {children}
        </commentContext.Provider>
    );
}

export default CommentProvider;