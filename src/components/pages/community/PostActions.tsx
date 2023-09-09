"use client";
import { Heart, Pencil, Flag, Trash2 } from "lucide-react";
import useSWR, { type KeyedMutator } from "swr";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { fetcher } from "@/lib/api/fetcher";

type PostLikes = { likesCount: number; likedByMe: boolean };
type PostActionsProps = {
  likesCount: number;
  postId: string;
  ownerId: string;
};

async function like(id: string, mutate: KeyedMutator<PostLikes>) {
  try {
    await mutate(
      async () => {
        const request = await fetch("/api/community", {
          method: "POST",
          body: JSON.stringify({
            id,
          }),
          headers: {
            "Content-Type": "application/json",
            "x-content-type": "like-post",
          },
        });

        if (!request.ok) throw request;

        const data = (await request.json()) as PostLikes;
        return data;
      },
      {
        rollbackOnError: true,
        revalidate: false,
        populateCache: true,
        optimisticData(currentData) {
          if (!currentData) throw new Error("Failed to update ui");
          return {
            likedByMe: true,
            likesCount: currentData.likesCount + 1,
          };
        },
      },
    );
  } catch (error) {
    console.error(error);
  }
}
async function unlike(id: string, mutate: KeyedMutator<PostLikes>) {
  try {
    await mutate(
      async () => {
        const request = await fetch(`/api/community?id=${id}`, {
          method: "DELETE",
          headers: {
            "x-content-type": "like-post",
          },
        });

        if (!request.ok) throw request;
        const data = (await request.json()) as PostLikes;
        return data;
      },
      {
        revalidate: false,
        populateCache: true,
        rollbackOnError: true,
        optimisticData(currentData) {
          if (!currentData) throw new Error("Failed to update ui");

          return {
            likedByMe: false,
            likesCount: currentData.likesCount - 1,
          };
        },
      },
    );
  } catch (error) {
    console.error(error);
  }
}
async function report(id: string, reason: string) {
  try {
    const response = await fetch("/api/community", {
      method: "POST",
      body: JSON.stringify({
        id,
        reason,
      }),
      headers: {
        "x-content-type": "report-post",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw response;
  } catch (error) {
    console.error(error);
  }
}
async function deletePost(id: string) {
  try {
    const response = await fetch(`/api/community/topic?id=${id}`, {
      method: "DELETE",
    });

    if (!response.ok) throw response;
  } catch (error) {
    console.error(error);
  }
}

const PostActions: React.FC<PostActionsProps> = ({
  postId,
  ownerId,
  likesCount,
}) => {
  const router = useRouter();
  const [reportDialog, setReportDialog] = useState(false);
  const { data: session, status } = useSession();
  const { data, mutate } = useSWR<PostLikes, Response, [string, string] | null>(
    postId ? ["/api/community", postId] : null,
    ([url, id]) => fetcher(`${url}?post=${id}`),
    {
      fallback: {
        likesCount,
        likedByMe: false,
      },
      revalidateOnFocus: false,
    },
  );

  if (status !== "authenticated")
    return (
      <div className="flex justify-end gap-1 p-0.5 text-zinc-600">
        <Button
          className="h-8 gap-2"
          variant="ghost"
          type="button"
          title="like this post"
        >
          {(data?.likesCount ?? 0) > 0 ? (
            <span>{data?.likesCount ?? 0}</span>
          ) : null}
          <Heart className="h-5 w-5" />
        </Button>
      </div>
    );

  return (
    <div className="flex justify-end gap-1 p-0.5 text-zinc-600">
      {session.user.id === ownerId ? (
        <Button
          asChild
          variant="ghost"
          size="icon"
          title="Edit Post"
          className="mr-auto h-8"
        >
          <Link
            href={{
              pathname: "/community/topic",
              query: { edit: postId },
            }}
          >
            <Pencil className="h-5 w-5" />
          </Link>
        </Button>
      ) : null}
      <Button
        className="h-8 min-w-min gap-2 ui-active:text-red-400 ui-active:hover:text-red-500"
        type="button"
        title={data?.likedByMe ? "Unlike this post" : "Like this post"}
        data-headlessui-state={data?.likedByMe ? "active" : ""}
        variant="ghost"
        onClick={() =>
          data?.likedByMe ? unlike(postId, mutate) : like(postId, mutate)
        }
      >
        {(data?.likesCount ?? 0) > 0 ? (
          <span>{data?.likesCount ?? 0}</span>
        ) : null}
        <Heart className="h-5 w-5" />
      </Button>
      <Dialog open={reportDialog} onOpenChange={setReportDialog}>
        <DialogTrigger asChild>
          <Button
            className="h-8 w-8"
            disabled={!!session.user.banned}
            title="Privately flag this post for attention"
            variant="ghost"
            size="icon"
          >
            <Flag className="h-5 w-5" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Post</DialogTitle>
            <DialogDescription>
              Privately flag this post for attention.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={async (ev) => {
              ev.preventDefault();
              const data = new FormData(ev.target as HTMLFormElement);
              const reason = data.get("reason")?.toString();

              if (!reason) return;

              await report(postId, reason);
              setReportDialog(false);
            }}
          >
            <div className="grid gap-4 py-4">
              <Label htmlFor="reason">Reason for report</Label>
              <Textarea
                placeholder="Reason for reporting"
                required
                minLength={10}
                maxLength={256}
                id="reason"
                name="reason"
              />
            </div>
            <DialogFooter>
              <Button type="submit">Send</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {session.user.id === ownerId ? (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              className="h-8 w-8 text-red-500 hover:text-red-500/90 dark:text-red-900 dark:hover:text-red-900/90"
              title="Delete your post"
              variant="ghost"
              size="icon"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Post</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure that you want to delete this post?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() =>
                  deletePost(postId).then(() => router.replace("/community"))
                }
              >
                Yes
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : null}
    </div>
  );
};

export default PostActions;
