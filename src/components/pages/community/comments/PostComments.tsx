"use client";
import { signIn, useSession } from "next-auth/react";
import RichTextEditor from "@/components/pages/community/editor/dynamicRichTextEditor";
import useComments from "@/hooks/community/useComments";
import { Separator } from "@/components/ui/separator";
import SkeletionComment from "./SkeletonComment";
import { Button } from "@/components/ui/button";
import PostComment from "./PostComment";

const PostComments: React.FC = () => {
    const { data: session, status } = useSession();
    const { comments, nextPage, prevPage, createComment, postId } = useComments();

    return (
        <>
            {status === "authenticated" && session.user.banned === 0 ? (
                <RichTextEditor postId={postId} onSubmit={createComment} />
            ) : (
                <div className="mt-6 flex flex-col w-full items-center justify-center gap-4">
                    <span>Login to comment</span>
                    <Button onClick={() => signIn()}>
                        Login
                    </Button>
                </div>
            )}
            <div className="mb-2 flex items-center justify-between">
                <div className="p-1">Comments</div>
            </div>
            <Separator />
            <ul className="divide-y space-y-2">
                {comments.isLoading ? (
                    <>
                        <SkeletionComment />
                        <SkeletionComment />
                        <SkeletionComment />
                    </>
                ) : comments.error ? (
                    <li>Failed to load comments</li>
                ) : !comments.data?.result.length ? (
                    <li className="py-4 text-center text-lg font-bold">
                        No comments yet.
                    </li>
                ) : (comments.data.result.map(comment => (
                    <PostComment key={comment.id} data={comment} />
                )))}
            </ul>
            <div className="mt-5 flex items-center justify-evenly">
                <Button onClick={prevPage} disabled={comments.isLoading || comments.data?.isFirstPage}>
                    Prev
                </Button>
                <div>{comments.data?.currentPage ?? 1} of {comments.data?.pageCount ?? 1}</div>
                <Button onClick={nextPage} disabled={comments.isLoading || comments.data?.isLastPage}>
                    Next
                </Button>
            </div>
        </>
    );
}

export default PostComments;