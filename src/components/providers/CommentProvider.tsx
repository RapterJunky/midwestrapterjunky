"use client";
import useSWR, { type KeyedMutator, type SWRResponse } from "swr";
import { createContext, useState } from "react";
import type { User, Comment } from "@prisma/client";
import type { Paginate } from "@/types/page";
import { fetcher } from "@/lib/api/fetcher";
import { useSession } from "next-auth/react";

export type TComment = Omit<Comment, "ownerId" | "threadPostId"> & {
    owner: Omit<User, "email" | "emailVerified">;
    likedByMe: boolean;
    likeCount: number;
    children: number;
};

type CommentContext = {
    comments: SWRResponse<Paginate<TComment>, Response, unknown>,
    session: ReturnType<typeof useSession>,
    like: (commentId: string) => Promise<void>,
    unlike: (commentId: string) => Promise<void>,
    report: (commentId: string, reason: string) => Promise<void>
    deleteComment: (commentId: string) => Promise<void>,
    createComment: (formData: FormData) => Promise<void>,
    updateComment: (formData: FormData) => Promise<void>,
    nextPage: () => void,
    prevPage: () => void
}

async function like(commentId: string, mutate: KeyedMutator<Paginate<TComment>>) {
    await mutate<Paginate<TComment>>(async (currentData) => {
        const request = await fetch(`/api/community/comments`, {
            method: "POST",
            body: JSON.stringify({
                type: "like",
                id: commentId,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (!request.ok) throw request;
        if (!currentData) throw new Error("Failed to update");
        const idx = currentData.result.findIndex(
            (value) => value.id === commentId,
        );
        if (idx === -1) throw new Error("Failed to find comment");
        const comments = currentData.result;
        if (!comments[idx]) throw new Error("Failed to find item");
        const comment = await request.json() as TComment;
        comments[idx] = comment;
        return { ...currentData, result: comments };
    }, {
        revalidate: false,
        rollbackOnError: true,
        populateCache: true,
        optimisticData(currentData) {
            if (!currentData) throw new Error("Unable to optimisticly update");
            const idx = currentData.result.findIndex(value => value.id === commentId);
            if (idx === -1) throw new Error("Failed to find comment");

            const comments = currentData.result;
            const comment = comments.at(idx);
            if (!comment) throw new Error("Failed to get comment");
            comment.likedByMe = true;
            comment.likeCount++;
            return { ...currentData, result: comments }
        },
    })
}

async function unlike(commnetId: string, mutate: KeyedMutator<Paginate<TComment>>) {
    await mutate<Paginate<TComment>>(async (currentData) => {
        if (!currentData) throw new Error("Unable to update comment");
        const idx = currentData.result.findIndex(value => value.id === commnetId);
        if (idx === -1) throw new Error("Failed to find comment");

        const request = await fetch(
            `/api/community/comments?type=like&id=${commnetId}`,
            {
                method: "DELETE",
            },
        );

        if (!request.ok) throw request;

        const comments = currentData.result;
        if (!comments[idx]) throw new Error("Unable to update ui");

        const comment = await request.json() as TComment;

        comments[idx] = comment;

        return { ...currentData, result: comments };
    }, {
        revalidate: false,
        populateCache: true,
        rollbackOnError: true,
        optimisticData(currentData) {
            if (!currentData) throw new Error("Unable to optimistic update.");

            const idx = currentData.result.findIndex(value => value.id === commnetId);
            if (idx === -1) throw new Error("Failed to update comment with optimistic data");

            const comments = currentData.result;
            const comment = comments.at(idx);
            if (!comment) throw new Error("Failed to get comment optimisticly update.");

            comment.likedByMe = false;
            comment.likeCount--;

            return { ...currentData, result: comments };
        },
    });
}

async function report(commentId: string, reason: string) {
    const request = await fetch(
        "/api/community/comments",
        {
            method: "POST",
            body: JSON.stringify({
                type: "report",
                id: commentId,
                reason,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        },
    );

    if (!request.ok) throw request;
}

async function deleteComment(commentId: string, mutate: KeyedMutator<Paginate<TComment>>) {
    await mutate<Paginate<TComment>>(async (currentData) => {
        const request = await fetch(
            `/api/community/comments?type=comment&id=${commentId}`,
            {
                method: "DELETE",
            },
        );

        if (!request.ok) throw request;
        if (!currentData) throw new Error("No data to update");

        return {
            ...currentData,
            result: currentData.result.filter(value => value.id !== commentId),
        };
    }, {
        revalidate: false,
        populateCache: true,
        rollbackOnError: true,
        optimisticData(currentData) {
            if (!currentData) throw new Error("No data to update");
            return {
                ...currentData,
                result: currentData.result.filter(value => value.id !== commentId)
            }
        },
    });
}

async function createComment(formData: FormData, mutate: KeyedMutator<Paginate<TComment>>) {
    const request = await fetch("/api/community/create", {
        method: "POST",
        body: formData,
        headers: {
            "X-Type": "comment",
        },
    });
    if (!request.ok) throw request;

    const comment = await request.json() as TComment;

    await mutate<Paginate<TComment>>((currentData) => {
        if (!currentData) throw new Error("Failed to create");
        return { ...currentData, result: [comment, ...currentData.result] }
    }, {
        revalidate: false,
        populateCache: false
    });
}

async function updateComment(formData: FormData, mutate: KeyedMutator<Paginate<TComment>>) {
    const request = await fetch("/api/community/create", {
        method: "PATCH",
        body: formData,
        headers: {
            "X-Type": "comment",
        },
    });

    if (!request.ok) throw request;

    const comment = await request.json() as TComment;

    await mutate<Paginate<TComment>>((currentData) => {
        if (!currentData) throw new Error("Failed to update");
        return {
            ...currentData,
            result: [
                comment,
                ...currentData?.result.filter(value => value.id !== comment.id)
            ]
        }
    }, {
        rollbackOnError: true,
        revalidate: false,
        populateCache: true
    });
}

export const commentContext = createContext<CommentContext | null>(null);

const CommentProvider: React.FC<React.PropsWithChildren<{ postId: string; }>> = ({ postId, children }) => {
    const session = useSession();
    const [page, setPage] = useState(1);
    const comments = useSWR<Paginate<TComment>, Response, [string, string, number] | null>(postId ? ["/api/community/comments", postId, page] : null, ([url, id, pageNumber]) => fetcher(`${url}?post=${id}&page=${pageNumber}`),
        {
            revalidateOnFocus: false,
        },
    );

    return (
        <commentContext.Provider value={{
            comments,
            session,
            deleteComment: (commentId) => deleteComment(commentId, comments.mutate),
            report: (commentId, reason) => report(commentId, reason),
            like: (commentId) => like(commentId, comments.mutate),
            unlike: (commentId) => unlike(commentId, comments.mutate),
            createComment: formData => createComment(formData, comments.mutate),
            updateComment: formData => updateComment(formData, comments.mutate),
            nextPage: () => setPage(current => current + 1),
            prevPage: () => setPage(current => current - 1)
        }}>
            {children}
        </commentContext.Provider>
    );
}

export default CommentProvider;