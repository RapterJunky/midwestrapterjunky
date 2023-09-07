import { Heart, Pencil, Trash2, User2 } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { TComment } from "@/components/providers/CommentProvider";
import RichTextEditor from "../editor/dynamicRichTextEditor";
import { formatLocalDate } from "@/lib/utils/timeFormat";
import CommentReportDialog from "./CommentReportDialog";
import useComments from "@/hooks/community/useComments";
import HtmlArticle from "@/components/HtmlArticle";
import { Button } from "@/components/ui/button";

const PostComment: React.FC<{ data: TComment }> = ({ data }) => {
  const [edit, setEdit] = useState(false);
  const {
    session: { data: session, status },
    report,
    like,
    unlike,
    deleteComment,
    updateComment
  } = useComments();

  return (
    <li className="flex w-full flex-col gap-2 py-2 animate-in fade-in-10">
      <div className="flex w-full">
        <Avatar>
          <AvatarImage asChild src={data?.owner.image ?? ""}>
            <Image
              width={40}
              height={40}
              src={data?.owner.image ?? ""}
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
          {
            edit ? (
              <section className="mb-4">
                <RichTextEditor onSubmit={async (formData) => {
                  setEdit(false);
                  await updateComment(formData);
                }} id={data.id} content={data.content} />
              </section>
            ) : (
              <article className="prose min-h-[50px] max-w-none prose-headings:my-0 prose-p:my-0 prose-a:cursor-pointer prose-a:text-blue-500">
                {data.content ? (
                  <HtmlArticle content={data.content} />
                ) : (
                  "Missing comment content!"
                )}
              </article>
            )
          }
          <div className="flex justify-between text-zinc-500">
            <div className="flex items-center gap-2">
              {status === "authenticated" &&
                session?.user.id === data.owner.id ? (
                <Button
                  onClick={() => setEdit(current => !current)}
                  className="h-8 w-8 hover:text-black"
                  variant="ghost"
                  size="icon"
                  aria-label="Edit comment"
                  title="Edit comment"
                >
                  <Pencil className="h-5 w-5" />
                </Button>
              ) : null}
            </div>
            <div className="flex items-center justify-end gap-1 text-zinc-500">
              <Button
                onClick={() =>
                  data.likedByMe ? unlike(data.id) : like(data.id)
                }
                variant="ghost"
                className="h-8 ui-active:text-red-400"
                data-headlessui-state={data.likedByMe ? "active" : ""}
                title="Like this comment"
                disabled={status !== "authenticated"}
                aria-label={data.likedByMe ? "Unlike comment" : "Like Comment"}
              >
                {data.likeCount > 0 ? (
                  <span className="mx-2">{data.likeCount}</span>
                ) : null}
                <Heart className="h-5 w-5" />
              </Button>
              {status === "authenticated" ? (
                <>
                  <CommentReportDialog
                    disabled={!!session?.user.banned}
                    id={data.id}
                    report={report}
                  />
                  {session?.user.id === data.owner.id ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          className="h-8 w-8"
                          variant="ghost"
                          size="icon"
                          aria-label="Delete your comment"
                          title="Delete your comment"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete your comment and remove your data from our
                            servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteComment(data.id)}
                            variant="destructive"
                          >
                            Continue
                          </AlertDialogAction>
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
};
export default PostComment;
