import { Lock, Pin, User2 } from "lucide-react";
import type { Metadata, ResolvingMetadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { z } from "zod";
import HtmlArticle from "@/components/HtmlArticle";
import PostComments from "@/components/pages/community/comments/PostComments";
import PostActions from "@/components/pages/community/PostActions";
import SuggestedPosts from "@/components/pages/community/SuggestedPosts";
import CommentProvider from "@/components/providers/CommentProvider";
import SessionProvider from "@/components/providers/SessionProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import getSeoTags from "@/lib/helpers/getSeoTags";
import getPost from "@/lib/services/community/getPost";
import { formatLocalDate } from "@/lib/utils/timeFormat";

type PageParams = {
  params: { id: string };
};

export async function generateMetadata(
  { params }: PageParams,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const id = z.string().uuid().safeParse(params.id);
  if (!id.success)
    return getSeoTags({
      parent,
      seo: {
        title: "Not Found",
        robots: false,
        description: "Given id is invaild",
      },
    });

  const post = await getPost(id.data);
  if (!post)
    return getSeoTags({
      parent,
      seo: {
        title: "Not Found",
        robots: false,
        description:
          "Midwest raptor junkies does not have a post with given id",
      },
    });

  return getSeoTags({
    parent,
    seo: {
      title: post.name,
      robots: true,
      description: "Midwest Raptor Junkies community page",
      slug: `/community/post/${params.id}`,
    },
  });
}

const Post: React.FC<PageParams> = async ({ params }) => {
  const id = z.string().uuid().safeParse(params.id);
  if (!id.success) notFound();

  const post = await getPost(id.data);
  if (!post) notFound();

  return (
    <SessionProvider>
      <div className="mt-20 flex flex-1 flex-col items-center">
        <div className="container my-4 max-w-4xl divide-y-2 px-4">
          <header className="mb-4">
            <h1 className="mb-1 flex items-center gap-1 text-xl font-bold md:text-3xl">
              {post.locked ? (
                <span className="text-zinc-500">
                  <Lock />
                </span>
              ) : null}
              {post.pinned ? (
                <span className="text-zinc-500">
                  <Pin />
                </span>
              ) : null}
              {post.name}
            </h1>
            <div className="mb-2 flex flex-wrap gap-2">
              {((post.tags as string[]) ?? []).map((tag, i) => (
                <Badge key={i}>{tag}</Badge>
              ))}
            </div>
          </header>
          <div className="mb-4 flex w-full pt-2">
            <div className="w-full px-2">
              <div className="flex gap-2">
                <div>
                  <Avatar>
                    <AvatarImage asChild src={post.owner.image ?? ""}>
                      <Image
                        src={post.owner.image ?? ""}
                        alt="avatar"
                        width={40}
                        height={50}
                      />
                    </AvatarImage>
                    <AvatarFallback>
                      <User2 />
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="mb-2 flex w-full justify-between text-neutral-600">
                  <div className="font-bold">{post.owner.name}</div>
                  <div>
                    {formatLocalDate(post.createdAt, undefined, {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </div>
              <article className="prose mb-4 max-w-none py-2 prose-headings:my-0 prose-p:my-0 prose-a:cursor-pointer prose-a:text-blue-500">
                <HtmlArticle content={post.content} />
              </article>
              <PostActions
                postId={post.id}
                ownerId={post.ownerId}
                likesCount={post._count.likes}
              />
            </div>
          </div>
          <section className="my-4">
            {post.locked ? (
              <div className="mt-6 flex w-full justify-center gap-4">
                Post is locked
              </div>
            ) : (
              <CommentProvider postId={post.id}>
                <PostComments />
              </CommentProvider>
            )}
          </section>
        </div>
        <div className="mb-4 w-full max-w-5xl px-4">
          <h1 className="text-xl font-bold">Suggested Topics</h1>
          <SuggestedPosts
            tags={(post.tags as string[]) ?? []}
            ignore={post.id}
          />
        </div>
      </div>
    </SessionProvider>
  );
};

export default Post;
