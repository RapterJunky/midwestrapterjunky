import type {
  GetStaticPropsResult,
  GetStaticPropsContext,
  NextPage,
} from "next";
import type { SeoOrFaviconTag } from "react-datocms";
import Link from "next/link";
import { HiArrowRight } from "react-icons/hi";

import Navbar from "@components/Navbar";
import SiteTags from "@components/SiteTags";
import Footer from "@components/Footer";
import ExitPreview from "@components/ExitPreview";
import Tag from "@components/blog/tag";

import { DatoCMS } from "@api/gql";
import { getDescriptionTag } from "@lib/utils/description";
import { formatLocalDate } from "@lib/utils/timeFormat";
import QueryBlogLatest from "@query/queries/blogLatest";

import type { FullPageProps } from "@lib/types/page";
import { REVAILDATE_IN_2H } from "@lib/RevaildateTimings";

interface BlogLatestProps extends FullPageProps {
  posts: {
    slug: string;
    publishedAt: string | null;
    title: string;
    seo: SeoOrFaviconTag[];
    tags: string[];
  }[];
}

const MAX_DISPLAY = 5;

//https://github.com/timlrx/tailwind-nextjs-starter-blog/blob/master/components/Tag.js

export const getStaticProps = async (
  ctx: GetStaticPropsContext
): Promise<GetStaticPropsResult<BlogLatestProps>> => {
  const data = await DatoCMS<BlogLatestProps>(QueryBlogLatest, {
    preview: ctx.preview,
    variables: {
      first: MAX_DISPLAY,
    },
  });

  return {
    props: {
      ...data,
      preview: ctx?.preview ?? false,
    },
    revalidate: REVAILDATE_IN_2H,
  };
};

const BlogLatest: NextPage<BlogLatestProps> = ({
  _site,
  navbar,
  preview,
  posts,
}) => {
  return (
    <div className="h-full flex flex-col">
      <SiteTags
        tags={[
          _site.faviconMetaTags,
          [
            { tag: "title", content: " Blog Lastest - Midwest Raptor Junkies" },
            {
              tag: "meta",
              attributes: {
                name: "description",
                content: "Midwest Raptor Junkies latest published articles.",
              },
            },
          ],
        ]}
      />
      <header>
        <Navbar {...navbar} mode="none" />
      </header>
      <main className="mx-auto max-w-3xl px-4 sm:px-6 xl:max-w-5xl xl:px-0 flex-1">
        <div className="divide-y divide-gray-200">
          <div className="space-y-2 pt-6 pb-8 md:space-y-5">
            <h1 className="font-inter md:leading-14 text-3xl font-extrabold leading-9 tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl">
              Latest
            </h1>
            <p className="font-inter text-lg leading-7 text-gray-500">
              The lastest articles are here.
            </p>
          </div>
          <ul className="divide-y divide-gray-200">
            {!posts.length ? "No posts found." : null}
            {posts.map((post) => {
              return (
                <li key={post.slug} className="py-12">
                  <article>
                    <div className="space-y-2 xl:grid xl:grid-cols-4 xl:items-baseline xl:space-y-0">
                      <dl>
                        <dt className="sr-only">Published on</dt>
                        <dd className="font-inter text-base font-medium leading-6 text-gray-500">
                          <time dateTime={post?.publishedAt ?? ""}>
                            {formatLocalDate(post?.publishedAt)}
                          </time>
                        </dd>
                      </dl>
                      <div className="space-y-5 xl:col-span-3">
                        <div className="space-y-6">
                          <div>
                            <h2 className="text-2xl font-bold leading-8 tracking-tight">
                              <Link
                                href={`/blog/${post.slug}`}
                                className="text-gray-900"
                              >
                                {post.title}
                              </Link>
                            </h2>
                            <div className="flex flex-wrap">
                              {post.tags.map((tag) => (
                                <Tag key={tag} text={tag} />
                              ))}
                            </div>
                          </div>
                          <summary className="prose max-w-none text-gray-500">
                            {getDescriptionTag(post.seo)}
                          </summary>
                        </div>
                        <div className="text-base font-medium leading-6">
                          <Link
                            href={`/blog/${post.slug}`}
                            className="flex items-center gap-2 text-red-500 hover:text-red-600"
                            aria-label={`Read "${post.title}"`}
                          >
                            Read more <HiArrowRight />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex justify-end text-base font-medium leading-6">
          <Link
            href="/blog/list"
            className="flex items-center gap-2 text-red-500 hover:text-red-600"
            aria-label="all posts"
          >
            All Posts <HiArrowRight />
          </Link>
        </div>
      </main>
      <div className="mt-2">
        <Footer />
      </div>
      {preview ? <ExitPreview /> : null}
    </div>
  );
};

export default BlogLatest;
