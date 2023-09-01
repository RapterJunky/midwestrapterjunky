import type { TComment } from "@/components/providers/CommentProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import useComments from "@/hooks/community/useComments";
import { renderBlock } from "@/lib/structuredTextRules";
import { formatLocalDate } from "@/lib/utils/timeFormat";
import { Heart, Pencil, Trash2, User2 } from "lucide-react";
import Image from "next/image";
import { StructuredText } from "react-datocms/structured-text";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTrigger,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import CommentReportDialog from "./CommentReportDialog";


const PostComment: React.FC<{ data: TComment }> = ({ data }) => {
    const {
        session: {
            data: session,
            status
        },
        report,
        like,
        unlike,
        deleteComment
    } = useComments();

    return (
        <li className="flex w-full flex-col gap-2 py-2 animate-in fade-in-10">
            <div className="flex w-full">

                <Avatar>
                    <AvatarImage asChild src={data.owner.image ?? ""}>
                        <Image
                            width={40}
                            height={40}
                            src={data.owner.image ?? ""}
                            alt="avatar"
                        />
                    </AvatarImage>
                    <AvatarFallback>
                        <User2 />
                    </AvatarFallback>
                </Avatar>

                <div className="flex w-full flex-col px-2">
                    <div className="mb-1 flex justify-between text-zinc-600">
                        <div className="font-bold">{data.owner.name}</div>
                        <div>
                            {formatLocalDate(data.created, undefined, {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                            })}
                        </div>
                    </div>
                    <article className="prose min-h-[50px] max-w-none">
                        {data.content ? (
                            <StructuredText renderBlock={renderBlock} data={data.content as PrismaJson.PostComment} />
                        ) : (
                            "Missing comment content!"
                        )}
                    </article>
                    <div className="flex justify-between">
                        <div className="flex items-center gap-2">
                            {status === "authenticated" && session?.user.id === data.owner.id ? (
                                <Button variant="ghost" size="icon" aria-label="Edit comment" title="Edit comment">
                                    <Pencil />
                                </Button>
                            ) : null}
                        </div>
                        <div className="flex items-center justify-end gap-1 text-zinc-500">
                            <Button onClick={() => data.likedByMe ? unlike(data.id) : like(data.id)} variant="ghost" size="icon" className="ui-active:text-red-400 min-w-min" data-headlessui-state={data.likedByMe ? "active" : ""} title="Like this comment" disabled={status !== "authenticated"} aria-label={data.likedByMe ? "Unlike comment" : "Like Comment"}>
                                {data.likeCount > 0 ? (
                                    <span className="mx-2">{data.likeCount}</span>
                                ) : null}
                                <Heart className="[&:not(first-child)]:mr-2" />
                            </Button>
                            {status === "authenticated" ? (
                                <>
                                    <CommentReportDialog disabled={!!session?.user.banned} id={data.id} report={report} />
                                    {session?.user.id === data.owner.id ? (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" aria-label="Delete your comment" title="Delete your comment">
                                                    <Trash2 />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete your
                                                        comment and remove your data from our servers.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => deleteComment(data.id)} variant="destructive">Continue</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    ) : null}
                                </>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        </li>
    );
}
export default PostComment;