import type {
  GetStaticPropsContext,
  GetStaticPropsResult,
  NextPage,
} from "next";
import type { SeoOrFaviconTag } from "react-datocms";
import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";

import type { FullPageProps } from "@lib/types";
import { DATOCMS_Fetch } from "@lib/gql";
import { formatLocalDate } from "@lib/utils/timeFormat";
import { getDescriptionTag } from "@lib/utils/description";

import Navbar from "@components/Navbar";
import SiteTags from "@components/SiteTags";
import Tag from "@components/blog/tag";

import GenericPageQuery from "@query/queries/generic";
import Footer from "@components/Footer";
import Pagination from "@components/blog/Pagination";
import ExitPreview from "@components/ExitPreview";

interface BlogListProps extends FullPageProps {}

interface Post {
  posts: {
    id: string;
    slug: string;
    title: string;
    publishedAt: string;
    tags: string[];
    seo: SeoOrFaviconTag[];
  }[];
  totalArticles: {
    count: number;
  };
}

export const getStaticProps = async (
  ctx: GetStaticPropsContext
): Promise<GetStaticPropsResult<BlogListProps>> => {
  const data = await DATOCMS_Fetch<BlogListProps>(GenericPageQuery, {
    preview: ctx.preview,
  });

  return {
    props: {
      ...data,
      preview: ctx?.preview ?? false,
    },
  };
};

const BlogList: NextPage<BlogListProps> = ({ preview, navbar, _site }) => {
  const [pageIndex, setPageIndex] = useState<number>(0);
  const { data, error, isLoading } = useSWR<Post, Response>(
    `/api/blog?page=${pageIndex}`,
    (uri) => fetch(uri).then((value) => value.json())
  );

  return (
    <div className="flex h-full flex-col">
      <SiteTags
        tags={[_site.faviconMetaTags, [{ tag: "title", content: "Articles" }]]}
      />
      <header>
        <Navbar {...navbar} mode="none" />
      </header>
      <main className="mx-auto flex max-w-3xl flex-grow flex-col px-4 sm:px-6 xl:max-w-5xl xl:px-0">
        <div className="divide-y divide-gray-200">
          <div className="space-y-2 pt-6 pb-8 md:space-y-5">
            <h1 className="md:leading-14 text-3xl font-extrabold leading-9 tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl">
              All Articles
            </h1>
          </div>
          <ul>
            {isLoading ? (
              <div className="mx-auto my-4 flex w-full flex-grow flex-col items-center justify-center p-4">
                <div
                  className="spinner-border inline-block h-12 w-12 animate-spin rounded-full border-4"
                  role="status"
                >
                  <span className="visually-hidden">Loading...</span>
                </div>
                <h3 className="p-3 font-sans"> Loading...</h3>
              </div>
            ) : (
              <>
                {error ? (
                  <div className="flex flex-col items-center justify-center">
                    <h1 className="mt-4 text-5xl font-bold">Opps</h1>
                    <p className="py-4">
                      Sorry, an unexpected error occurred. Try reloading the
                      page.
                    </p>
                    <span className="text-sm text-gray-500">
                      {error?.statusText ?? ""}
                    </span>
                  </div>
                ) : (
                  <>
                    {!data?.posts.length ? (
                      "No posts found."
                    ) : (
                      <>
                        {data.posts.map((post) => (
                          <li key={post.id} className="py-4">
                            <article>
                              <dl>
                                <dt className="sr-only">Published on</dt>
                                <dd className="text-base font-medium leading-6 text-gray-500">
                                  <time dateTime={post.publishedAt ?? ""}>
                                    {formatLocalDate(post.publishedAt)}
                                  </time>
                                </dd>
                              </dl>
                              <div className="space-y-3 xl:col-span-3">
                                <div>
                                  <h3 className="text-2xl font-bold leading-8 tracking-tight">
                                    <Link
                                      href={`/blog/${post.slug}`}
                                      className="text-gray-900"
                                    >
                                      {post.title}
                                    </Link>
                                  </h3>
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
                            </article>
                          </li>
                        ))}
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </ul>
        </div>
        <Pagination
          setIndex={setPageIndex}
          currentPage={pageIndex}
          isLoading={isLoading}
          total={data?.totalArticles.count ?? 0}
        />
      </main>
      <div className="h-20">
        <Footer />
      </div>
      {preview ? <ExitPreview /> : null}
    </div>
  );
};

export default BlogList;
