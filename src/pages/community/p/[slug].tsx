import type {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
  NextPage,
} from "next";
import { StructuredText } from "react-datocms/structured-text";
import type { SeoOrFaviconTag } from "react-datocms/seo";
import { serialize } from "superjson";
import Image from "next/image";
import { z } from "zod";

import TopicActions from "@/components/community/TopicActions";
import TopicsList from "@/components/community/TopicsList";
import HiLockClosed from "@components/icons/HiLockClosed";
import FaThumbtack from "@components/icons/FaThumbtack";
import TagList from "@components/community/TagList";
import Comments from "@components/thread/Comments";
import Navbar from "@components/layout/Navbar";
import Footer from "@components/layout/Footer";
import SiteTags from "@components/SiteTags";

import { renderBlock, renderInlineRecord } from "@lib/structuredTextRules";
import { formatLocalDate } from "@lib/utils/timeFormat";
import genericSeoTags from "@lib/utils/genericSeoTags";
import GenericPageQuery from "@/gql/queries/generic";
import type { FullPageProps } from "@type/page";
import { fetchCachedQuery } from "@lib/cache";
import { PostProvider } from "@hook/usePost";
import prisma from "@api/prisma";

interface Props extends FullPageProps {
  seo: SeoOrFaviconTag[];
  post: {
    _count: {
      likes: number;
    };
    id: string;
    name: string;
    created: string;
    ownerId: string;
    tags?: string[];
    owner: {
      image: string;
      name: string;
    };
    pinned: boolean;
    locked: boolean;
    content: PrismaJson.Dast;
    threadId: number;
  };
}

const idCheck = z.object({
  slug: z.string().uuid().nonempty(),
});

export const getStaticPaths = (): GetStaticPathsResult => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export const getStaticProps = async ({
  preview,
  params,
}: GetStaticPropsContext): Promise<GetStaticPropsResult<Props>> => {
  const check = idCheck.safeParse(params);
  if (!check.success)
    return {
      notFound: true,
    };

  const post = await prisma.threadPost.findUnique({
    where: {
      id: check.data.slug,
    },
    include: {
      _count: {
        select: {
          likes: true,
        },
      },
      owner: {
        select: {
          image: true,
          name: true,
        },
      },
    },
  });

  if (!post)
    return {
      notFound: true,
    };

  const props = await fetchCachedQuery<FullPageProps>(
    "GenericPage",
    GenericPageQuery
  );

  const { json } = serialize(post);

  return {
    props: {
      ...props,
      post: json as Props["post"],
      preview: preview ?? false,
      seo: genericSeoTags({
        title: post.name,
        description: post.name,
        url: `https://midwestraptorjunkies.com/community/p/${post.id}`,
      }),
    },
  };
};

const CommunityPost: NextPage<Props> = ({ navbar, _site, post, seo }) => {
  return (
    <div className="flex h-full flex-col">
      <SiteTags tags={[_site.faviconMetaTags, seo]} />
      <Navbar {...navbar} mode="only-scroll" />
      <PostProvider postId={post.id}>
        <main className="mt-20 flex flex-1 flex-col items-center">
          <div className="container my-4 max-w-4xl divide-y-2 px-4">
            <header className="mb-4">
              <h1 className="mb-1 flex items-center gap-1 text-xl font-bold md:text-3xl">
                {post.locked ? (
                  <span className="text-neutral-500">
                    <HiLockClosed />
                  </span>
                ) : null}
                {post.pinned ? (
                  <span className="text-neutral-500">
                    <FaThumbtack />
                  </span>
                ) : null}
                {post.name}
              </h1>
              <TagList tags={post.tags ?? []} />
            </header>
            <div className="mb-4 flex w-full pt-2">
              <div className="w-full px-2">
                <div className="flex gap-2">
                  <div>
                    <Image
                      className="rounded-full"
                      src={post.owner.image}
                      alt="avatar"
                      width={40}
                      height={50}
                    />
                  </div>
                  <div className="mb-2 flex w-full justify-between text-neutral-600">
                    <div className="font-bold">{post.owner.name}</div>
                    <div>
                      {formatLocalDate(post.created, undefined, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </div>
                <article className="prose mb-4 max-w-none py-2">
                  <StructuredText
                    renderBlock={renderBlock}
                    renderInlineRecord={renderInlineRecord}
                    data={post.content}
                  />
                </article>
                <TopicActions
                  likes={post._count.likes}
                  postId={post.id}
                  ownerId={post.ownerId}
                />
              </div>
            </div>
            <Comments locked={post.locked} />
          </div>
          <div className="mb-4 w-full max-w-5xl px-4">
            <h1 className="text-xl font-bold">Suggested Topics</h1>
            <TopicsList mode="suggest" sort="latest" tags={post.tags} ignore={post.id} />
          </div>
        </main>
      </PostProvider>
      <Footer />
    </div>
  );
};

export default CommunityPost;
