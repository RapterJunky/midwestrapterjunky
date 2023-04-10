import type {
  GetStaticPropsResult,
  GetStaticPropsContext,
  NextPage,
  GetStaticPathsResult,
} from "next";
import { useSession } from "next-auth/react";
import superjson from "superjson";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { HiFlag, HiTrash } from "react-icons/hi";
import { StructuredText } from "react-datocms/structured-text";
import { z } from "zod";

import SiteTags from "@components/SiteTags";
import Navbar from "@components/layout/Navbar";
import Footer from "@components/layout/Footer";
import ExitPreview from "@components/ExitPreview";
import ScrollToTop from "@components/blog/ScrollToTop";
import ReportDialog from "@components/dialogs/ReportDialog";
import Comments from "@components/thread/Comments";

import prisma, { type User, type Thread, type ThreadPost } from "@api/prisma";
import GenericPageQuery from "@query/queries/generic";
import type { FullPageProps, ResponsiveImage } from "@type/page";

import { fetchCachedQuery } from "@lib/cache";
import { formatLocalDate } from "@lib/utils/timeFormat";
import { renderBlock } from "@lib/structuredTextRules";
import { logger } from "@lib/logger";
import { useRouter } from "next/router";

interface Props extends FullPageProps {
  post: Pick<ThreadPost, "created" | "name" | "id" | "content"> & {
    owner: Pick<User, "id" | "name" | "image">;
    thread: Thread;
  };
}

export const getStaticPaths = (): GetStaticPathsResult => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export const getStaticProps = async (
  ctx: GetStaticPropsContext
): Promise<GetStaticPropsResult<Props>> => {
  try {
    const id = z.string().uuid().parse(ctx.params?.id);

    const post = await prisma.threadPost.findUniqueOrThrow({
      where: {
        id,
      },
      select: {
        created: true,
        name: true,
        content: true,
        id: true,
        thread: {
          select: {
            id: true,
            name: true,
          },
        },
        owner: {
          select: {
            image: true,
            name: true,
            id: true,
          },
        },
      },
    });

    const props = await fetchCachedQuery<Omit<Props, "post">>(
      "GenericPage",
      GenericPageQuery
    );

    // temp for borken swc plugin
    const { json } = superjson.serialize(post);

    return {
      props: {
        ...props,
        post: json as unknown as typeof post,
        preview: ctx?.preview ?? false,
      },
    };
  } catch (error) {
    logger.error(error);
    return {
      notFound: true,
    };
  }
};

const doc: PrismaJson.Dast["value"]["document"]["children"] = [
  {
    type: "heading",
    level: 1,
    children: [
      {
        type: "span",
        marks: [],
        value: "This is a level one heading!",
      },
    ],
  },
  {
    type: "heading",
    level: 2,
    children: [
      {
        type: "span",
        marks: [],
        value: "This is a level two heading!",
      },
    ],
  },
  {
    item: "119716320",
    type: "block",
  },
  {
    type: "heading",
    level: 3,
    children: [
      {
        type: "span",
        marks: [],
        value: "This is a level three heading!",
      },
    ],
  },
  {
    type: "heading",
    level: 4,
    children: [
      {
        type: "span",
        marks: [],
        value: "This is a level four heading!",
      },
    ],
  },
  {
    type: "heading",
    level: 5,
    children: [
      {
        type: "span",
        marks: [],
        value: "This is a level five heading!",
      },
    ],
  },
  {
    type: "heading",
    level: 6,
    children: [
      {
        type: "span",
        marks: [],
        value: "This is a level six heading!",
      },
    ],
  },
  {
    type: "paragraph",
    children: [
      {
        type: "span",
        value: "This is a ",
      },
      {
        type: "span",
        marks: ["strong"],
        value: "paragraph!",
      },
    ],
  },
  {
    type: "list",
    style: "bulleted",
    children: [
      {
        type: "listItem",
        children: [
          {
            type: "paragraph",
            children: [
              {
                type: "span",
                value: "this is a unordered list!",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    type: "list",
    style: "numbered",
    children: [
      {
        type: "listItem",
        children: [
          {
            type: "paragraph",
            children: [
              {
                type: "span",
                value: "this is a ordered list!",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    type: "thematicBreak",
  },
  {
    type: "paragraph",
    children: [
      {
        type: "link",
        url: "https://www.datocms.com/",
        meta: [
          { id: "rel", value: "nofollow" },
          { id: "target", value: "_blank" },
        ],
        children: [
          {
            type: "span",
            value: "Link",
          },
        ],
      },
    ],
  },
  {
    type: "blockquote",
    attribution: "Attribution",
    children: [
      {
        type: "paragraph",
        children: [
          {
            type: "span",
            value: "Im a quote",
          },
        ],
      },
    ],
  },
];

const ExampleDast: PrismaJson.Dast<{
  __typename: string;
  id: string;
  content: ResponsiveImage<{ width: number; height: number }>;
}> = {
  links: [],
  blocks: [
    {
      id: "119716320",
      __typename: "ImageRecord",
      content: {
        blurUpThumb: "",
        responsiveImage: {
          src: "https://www.datocms-assets.com/77949/1668115755-fg5_2100x.webp",
          sizes: "(max-width: 960px) 100vw, 960px",
          alt: null,
          width: 960,
          height: 720,
        },
      },
    },
  ],
  value: {
    schema: "dast",
    document: {
      type: "root",
      children: doc,
    },
  },
};

const Post: NextPage<Props> = ({ preview, _site, navbar, post }) => {
  const [show, setShow] = useState<boolean>(false);
  const session = useSession();
  const router = useRouter();

  const deletePost = async () => {
    try {
      const request = await fetch("/api/threads/post", {
        method: "DELETE",
        body: JSON.stringify({ id: post.id }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!request.ok) throw request;
      await router.push(`/threads/${post.thread.id}`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col">
      <ReportDialog
        reportHandle={async (state) => {
          try {
            const request = await fetch("/api/threads/post", {
              method: "POST",
              body: JSON.stringify({
                id: post.id,
                reason: state.get("reason"),
              }),
              headers: {
                "Content-Type": "application/json",
                "X-Type-Report": "true",
              },
            });
            if (!request.ok) throw request;
          } catch (error) {
            console.error(error);
          } finally {
            setShow(false);
          }
        }}
        show={show}
        onClose={() => setShow(false)}
        title="Report Post"
      />
      <SiteTags
        tags={[
          _site.faviconMetaTags,
          [{ tag: "title", content: `${post.name} - Midwest Raptor Junkies` }],
        ]}
      />
      <header>
        <Navbar {...navbar} mode="none" />
      </header>
      <main className="mx-4 flex flex-1 flex-col items-center gap-2 self-center">
        <div className="mt-5 flex w-full items-center gap-4">
          <Image
            src={post.owner.image ?? ""}
            alt="avatar"
            className="rounded-full"
            width={48}
            height={48}
          />
          <div>
            <div className="text-3xl font-bold">{post.name}</div>
            <span className="text-sm">
              By <span className="text-red-500">{post.owner.name}</span>, in{" "}
              <Link
                href={`/threads/${post.thread.id}`}
                className="text-red-500 underline active:text-red-700"
              >
                {post.thread.name}
              </Link>{" "}
              on {formatLocalDate(post.created, "en-us", { weekday: "short" })}{" "}
            </span>
          </div>
        </div>
        <hr className="w-full" />
        <div className="prose min-h-[320px] w-full max-w-none p-2">
          <StructuredText renderBlock={renderBlock} data={ExampleDast} />
        </div>
        <div className="w-full">
          <hr className="w-full" />
          <div className="mt-4 flex justify-between text-sm text-gray-600">
            <span>Tags: No Tags</span>

            <div className="flex gap-1 text-red-500">
              {session.data?.user.id === post.owner.id ? (
                <>
                  <button
                    onClick={deletePost}
                    className="flex items-center gap-1 hover:text-red-700"
                  >
                    <HiTrash /> Delete
                  </button>
                  •
                </>
              ) : null}
              <button
                onClick={() => setShow(true)}
                className="flex items-center gap-1 hover:text-red-700"
              >
                <HiFlag /> Report
              </button>
            </div>
          </div>
          <hr className="mt-4 w-full" />
        </div>
        <div className="w-full overflow-hidden" id="comment">
          <Comments post={post.id} />
        </div>
      </main>
      <ScrollToTop comments />
      <div className="mt-4 h-20">
        <Footer />
      </div>
      {preview ? <ExitPreview /> : null}
    </div>
  );
};

export default Post;
