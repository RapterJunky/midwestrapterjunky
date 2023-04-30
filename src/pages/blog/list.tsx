import type {
  GetStaticPropsContext,
  GetStaticPropsResult,
  NextPage,
} from "next";
import type { SeoOrFaviconTag } from "react-datocms";
import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";

import ExitPreview from "@/components/ui/ExitPreview";
import Navbar from "@components/layout/Navbar";
import Footer from "@components/layout/Footer";
import SiteTags from "@components/SiteTags";
import Tag from "@components/blog/tag";

import { getDescriptionTag } from "@lib/utils/description";
import type { FullPageProps, Paginate } from "types/page";
import { formatLocalDate } from "@lib/utils/timeFormat";
import genericSeoTags from "@/lib/utils/genericSeoTags";
import GenericPageQuery from "@query/queries/generic";
import { DatoCMS } from "@api/gql";

interface Post {
  id: string;
  slug: string;
  title: string;
  publishedAt: string;
  tags: string[];
  seo: SeoOrFaviconTag[];
}

type Props = FullPageProps & { seo: SeoOrFaviconTag[] };

export const getStaticProps = async (
  ctx: GetStaticPropsContext
): Promise<GetStaticPropsResult<Props>> => {
  const data = await DatoCMS<FullPageProps>(GenericPageQuery, {
    preview: ctx.preview,
  });

  return {
    props: {
      ...data,
      preview: ctx?.preview ?? false,
      seo: genericSeoTags({
        title: "Articles",
        description: "All of Midwest Raptor Junkies published articles.",
        url: "https://midwestraptorjunkies.com/blog/list"
      }),
    },
  };
};

const BlogList: NextPage<Props> = ({ preview, navbar, _site, seo }) => {
  const [pageIndex, setPageIndex] = useState<number>(0);
  const { data, error, isLoading } = useSWR<Paginate<Post>, Response, string>(
    `/api/blog?page=${pageIndex}`,
    (uri) => fetch(uri).then((value) => value.json() as Promise<Paginate<Post>>)
  );

  return (
    <div className="flex h-full flex-col">
      <SiteTags tags={[_site.faviconMetaTags, seo]} />
      <header>
        <Navbar {...navbar} mode="none" />
      </header>
      <main className="flex flex-grow flex-col items-center px-4">
        <div className="w-full max-w-3xl flex-1 divide-y divide-gray-200">
          <div className="space-y-2 pb-4 pt-6 sm:pb-8 md:space-y-5 md:pb-6">
            <h1 className="md:leading-14 text-3xl font-extrabold leading-9 tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl">
              All Articles
            </h1>
          </div>
          <ul>
            {isLoading ? (
              <div className="mx-auto my-4 flex w-full flex-grow flex-col items-center justify-center p-4">
                <div
                  className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                  role="status"
                >
                  <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                    Loading...
                  </span>
                </div>
                <h3 className="p-3 font-sans">Loading Articles...</h3>
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
                    {!data?.result || !data?.result.length ? (
                      "No posts found."
                    ) : (
                      <>
                        {data.result.map((post) => (
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
        <div className="w-full max-w-3xl space-y-2 pb-8 pt-6 md:space-y-5">
          <nav className="flex justify-between">
            <button
              aria-disabled={data?.isLastPage ? "true" : "false"}
              data-cy="pagination-previous-page"
              aria-label="Previous Page"
              className="inline-block rounded-sm bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 disabled:pointer-events-none disabled:opacity-70 ui-active:bg-primary-700 ui-active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)]"
              disabled={!!data?.isFirstPage}
              onClick={() => setPageIndex(data?.previousPage ?? 0)}
            >
              Prev
            </button>
            <span>
              {(data?.currentPage ?? 0) + 1} of {data?.pageCount ?? 1}
            </span>
            <button
              aria-disabled={data?.isLastPage ? "true" : "false"}
              data-cy="pagination-next-page"
              aria-label="Next Page"
              className="inline-block rounded-sm bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 disabled:pointer-events-none disabled:opacity-70 ui-active:bg-primary-700 ui-active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)]"
              disabled={!!data?.isLastPage}
              onClick={() => setPageIndex(data?.nextPage ?? 0)}
            >
              Next
            </button>
          </nav>
        </div>
      </main>
      <Footer />
      {preview ? <ExitPreview /> : null}
    </div>
  );
};

export default BlogList;
