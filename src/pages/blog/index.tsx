import type {
  GetStaticPropsResult,
  GetStaticPropsContext,
  NextPage,
} from "next";
import type { SeoOrFaviconTag } from "react-datocms";
import Link from "next/link";

import HiArrowRight from "@components/icons/HiArrowRight";
import ExitPreview from "@/components/ui/ExitPreview";
import Navbar from "@components/layout/Navbar";
import Footer from "@components/layout/Footer";
import SiteTags from "@components/SiteTags";
import Tag from "@components/blog/tag";

import { getDescriptionTag } from "@lib/utils/description";
import { REVAILDATE_IN_2H } from "@lib/revaildateTimings";
import { formatLocalDate } from "@lib/utils/timeFormat";
import QueryBlogLatest from "@query/queries/blogLatest";
import genericSeoTags from "@/lib/utils/genericSeoTags";
import type { FullPageProps } from "types/page";
import { DatoCMS } from "@api/gql";

interface BlogLatestProps extends FullPageProps {
  seo: SeoOrFaviconTag[];
  posts: {
    slug: string;
    publishedAt: string | null;
    title: string;
    seo: SeoOrFaviconTag[];
    tags: string[];
  }[];
}

const MAX_DISPLAY = 5;

export const getStaticProps = async (
  ctx: GetStaticPropsContext
): Promise<GetStaticPropsResult<BlogLatestProps>> => {
  const data = await DatoCMS<BlogLatestProps>(
    {
      query: QueryBlogLatest,
      variables: {
        first: MAX_DISPLAY,
      },
    },
    {
      draft: ctx.draftMode || ctx.preview,
    }
  );

  return {
    props: {
      ...data,
      preview: (ctx.draftMode || ctx.preview) ?? false,
      seo: genericSeoTags({
        title: "Blog Lastest",
        description: "Midwest Raptor Junkies latest published articles.",
        url: "https://midwestraptorjunkies.com/blog",
      }),
    },
    revalidate: REVAILDATE_IN_2H,
  };
};

const BlogLatest: NextPage<BlogLatestProps> = ({
  _site,
  navbar,
  preview,
  posts,
  seo,
}) => {
  return (
    <div className="flex h-full flex-col">
      <SiteTags tags={[_site.faviconMetaTags, seo]} />
      <header>
        <Navbar {...navbar} mode="none" />
      </header>
      <main className="mx-auto max-w-3xl flex-1 px-4 sm:px-6 xl:max-w-5xl xl:px-0">
        <div className="divide-y divide-gray-200">
          <div className="space-y-2 pb-8 pt-6 md:space-y-5">
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
                            className="flex items-center gap-2 text-blue-500 hover:text-blue-600"
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

        <div className="flex justify-end text-base font-medium leading-6 mb-4">
          <Link
            href="/blog/list"
            className="flex items-center gap-2 text-blue-500 hover:text-blue-600"
            aria-label="all posts"
          >
            All Posts <HiArrowRight />
          </Link>
        </div>
      </main>
      <Footer />
      {preview ? <ExitPreview /> : null}
    </div>
  );
};

export default BlogLatest;
