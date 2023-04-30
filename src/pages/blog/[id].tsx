import type {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
  NextPage,
} from "next";
import {
  StructuredText,
  type StructuredTextGraphQlResponse,
} from "react-datocms/structured-text";
import type { SeoOrFaviconTag } from "react-datocms/seo";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { z } from "zod";

import HiArrowLeft from "@components/icons/HiArrowLeft";
import ScrollToTop from "@components/blog/ScrollToTop";
import ExitPreview from "@components/ui/ExitPreview";
import Navbar from "@components/layout/Navbar";
import Footer from "@components/layout/Footer";
import SiteTags from "@components/SiteTags";
import Tag from "@components/blog/tag";

import { renderBlock, renderInlineRecord } from "@lib/structuredTextRules";
import type { FullPageProps, ResponsiveImage } from "types/page";
import ArticlesListQuery from "@query/queries/articles_list";
import GetNextArticles from "@query/queries/next_articles";
import { formatLocalDate } from "@lib/utils/timeFormat";
import ArticleQuery from "@query/queries/article";
import { fetchCacheData } from "@lib/cache";
import { logger } from "@lib/logger";
import { DatoCMS } from "@api/gql";

const Comments = dynamic(() => import("@components/blog/Comments"));

interface ArticleProps extends FullPageProps {
  next: { slug: string; title: string } | null;
  prev: { slug: string; title: string } | null;
  post: {
    title: string;
    content: StructuredTextGraphQlResponse<
      {
        __typename: string;
        id: string;
        content: ResponsiveImage<{ width: number; height: number }>;
      },
      { title: string; slug: string; __typename: string; id: string }
    >;
    publishedAt: string;
    prev: {
      slug: string;
      title: string;
    } | null;
    next: {
      slug: string;
      title: string;
    };
    authors: {
      avatar: string | null;
      name: string;
      social: {
        user: string;
        link: string;
      } | null;
    }[];
    seo: SeoOrFaviconTag[];
    slug: string;
    tags: string[];
    id: string;
    displayComments: number;
    enableComments: boolean | null;
    commentsAdmins: string[] | null;
  };
}

const PAGE_CACHE_KEY = "blog-pages";
const param_check = z.string();

const getBlogPage = async (
  id: string,
  preview: boolean
): Promise<ArticleProps> => {
  logger.info(`Blog Page (${id}) - preview(${preview}) | Genearting`);
  const data = await DatoCMS<ArticleProps>(ArticleQuery, {
    preview: preview,
    variables: {
      slug: id,
    },
  });

  const extra = await DatoCMS<{
    next: ArticleProps["next"];
    prev: ArticleProps["prev"];
  }>(GetNextArticles, {
    preview: preview,
    variables: {
      id: data.post.id,
      date: preview ? new Date().toISOString() : data.post.publishedAt,
    },
  });

  return {
    ...data,
    ...extra,
    preview,
  };
};

const loadBlogPages = async () => {
  const data = await DatoCMS<{ articles: { slug: string }[] }>(
    ArticlesListQuery
  );
  return data.articles.map((value) => value.slug);
};

export const getStaticPaths = async (): Promise<GetStaticPathsResult> => {
  await fetchCacheData(PAGE_CACHE_KEY, loadBlogPages, !!process.env?.CI);
  return {
    paths: [],
    fallback: "blocking",
  };
};

export const getStaticProps = async (
  ctx: GetStaticPropsContext
): Promise<GetStaticPropsResult<ArticleProps>> => {
  const schema = param_check.safeParse(ctx.params?.id);
  if (!schema.success)
    return {
      notFound: true,
    };

  const id = schema.data;

  if (ctx.preview) {
    const data = await getBlogPage(id, true);
    return {
      props: data,
    };
  }

  const pages = await fetchCacheData<string[]>(PAGE_CACHE_KEY, loadBlogPages);

  if (!pages.includes(id))
    return {
      notFound: true,
    };

  const data = await getBlogPage(id, false);

  return {
    props: data,
  };
};

const Article: NextPage<ArticleProps> = ({
  navbar,
  _site,
  preview,
  post,
  next,
  prev,
}) => {
  return (
    <div className="flex h-full flex-col">
      <SiteTags
        tags={[
          _site.faviconMetaTags,
          post.seo,
          [
            {
              tag: "meta",
              attributes: {
                property: "og:url",
                content: `https://midwestraptorjunkies.com/blog/${post.id}`,
              },
            },
          ],
          post.commentsAdmins?.map((value) => ({
            tag: "meta",
            attributes: { property: "fb:admins", content: value },
          })) ?? [],
        ]}
      />
      <Navbar {...navbar} mode="none" />
      <main className="mx-auto max-w-3xl flex-grow px-4 sm:px-6 xl:max-w-5xl xl:px-0">
        <ScrollToTop comments={false} />
        <article className="mb-auto">
          <div className="xl:divide-y xl:divide-gray-200">
            <header className="pt-6 xl:pb-6">
              <div className="space-y-1 text-center">
                <dl className="space-y-10">
                  <div>
                    <dt className="sr-only">Published on</dt>
                    <dd className="text-base font-medium leading-6 text-gray-500">
                      <time dateTime={post.publishedAt ?? ""}>
                        {formatLocalDate(post.publishedAt)}
                      </time>
                    </dd>
                  </div>
                </dl>
                <div>
                  <h1 className="md:leading-14 text-3xl font-extrabold leading-9 tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-5xl">
                    {post.title}
                  </h1>
                </div>
              </div>
            </header>
            <div
              className="divide-y divide-gray-200 pb-8 xl:grid xl:grid-cols-4 xl:gap-x-6 xl:divide-y-0"
              style={{ gridTemplateRows: "auto 1fr" }}
            >
              <dl className="pb-10 pt-6 xl:border-b xl:border-gray-200 xl:pt-11">
                <dt className="sr-only">Authors</dt>
                <dd>
                  <ul className="flex justify-center space-x-8 sm:space-x-12 xl:block xl:space-x-0 xl:space-y-8">
                    {post.authors.map((author, i) => (
                      <li className="flex items-center space-x-2" key={i}>
                        {author.avatar ? (
                          <Image
                            src={author.avatar}
                            width={38}
                            height={38}
                            alt="avatar"
                            className="h-10 w-10 rounded-full"
                          />
                        ) : null}
                        <dl className="whitespace-nowrap text-sm font-medium leading-5">
                          <dt className="sr-only">Name</dt>
                          <dd className="text-gray-900">{author.name}</dd>
                          <dt className="sr-only">Social</dt>
                          <dd>
                            {author.social ? (
                              <Link
                                className="text-blue-500 hover:text-blue-600"
                                href={author.social.link}
                              >
                                {author.social.user}
                              </Link>
                            ) : null}
                          </dd>
                        </dl>
                      </li>
                    ))}
                  </ul>
                </dd>
              </dl>
              <section className="divide-y divide-gray-200 xl:col-span-3 xl:row-span-2 xl:pb-0">
                <div className="prose max-w-none pb-8 pt-10">
                  <StructuredText
                    renderInlineRecord={renderInlineRecord}
                    renderBlock={renderBlock}
                    data={post.content}
                  />
                </div>
                {post.enableComments ? (
                  <Comments
                    pageSlug={post.slug}
                    numPosts={post.displayComments}
                  />
                ) : null}
              </section>
              <section>
                <div className="divide-gray-200 text-sm font-medium leading-5 xl:col-start-1 xl:row-start-2 xl:divide-y">
                  {post.tags ? (
                    <div className="py-4 xl:py-8">
                      <h2 className="text-xs uppercase tracking-wide text-gray-500">
                        Tags
                      </h2>
                      <div className="flex flex-wrap">
                        {post.tags.map((tag, i) => (
                          <Tag text={tag} key={i} />
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
                {next || prev ? (
                  <div className="flex justify-between py-4 xl:block xl:space-y-8 xl:py-8">
                    {prev ? (
                      <div>
                        <h2 className="text-xs uppercase tracking-wide text-gray-500">
                          Previous Article
                        </h2>
                        <div className="text-blue-500 hover:text-blue-600">
                          <Link href={`/blog/${prev.slug}`}>{prev.title}</Link>
                        </div>
                      </div>
                    ) : null}
                    {next ? (
                      <div>
                        <h2 className="text-xs uppercase tracking-wide text-gray-500">
                          Next Article
                        </h2>
                        <div className="text-blue-500 hover:text-blue-600">
                          <Link href={`/blog/${next.slug}`}>{next.title}</Link>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}
                <div className="pt-4 xl:pt-8">
                  <Link
                    href="/blog"
                    className="flex items-center text-blue-500 hover:text-blue-600"
                  >
                    <HiArrowLeft /> Back to the blog
                  </Link>
                </div>
              </section>
            </div>
          </div>
        </article>
      </main>
      <div className="h-20">
        <Footer />
      </div>
      {preview ? <ExitPreview /> : null}
    </div>
  );
};

export default Article;
