import {
  StructuredText,
  type StructuredTextGraphQlResponse,
} from "react-datocms/structured-text";
import { toNextMetadata, type SeoOrFaviconTag } from "react-datocms/seo";
import { ArrowLeft, User2 } from "lucide-react";
import type { TechArticle } from "schema-dts";
import type { Metadata } from "next";
import Script from "next/script";
import Image from "next/image";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { renderBlock, renderInlineRecord } from "@/lib/structuredTextRules";
import type { GenericPageResult } from "@/gql/queries/generic";
import { getDescriptionTag } from "@/lib/utils/description";
import GetNextArticles from "@/gql/queries/next_articles";
import { formatLocalDate } from "@/lib/utils/timeFormat";
import ScrollToTop from "@/components/blog/ScrollToTop";
import getPageQuery from "@/lib/services/GetPageQuery";
import { Separator } from "@/components/ui/separator";
import type { ResponsiveImage } from "@/types/page";
import ArticleQuery from "@/gql/queries/article";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type PageParams = {
  params: { slug: string };
};

interface ArticleProps extends GenericPageResult {
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
  };
}

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const { post, site } = await getPageQuery<ArticleProps>(ArticleQuery, {
    variables: { slug: params.slug },
  });

  return toNextMetadata([...post.seo, ...site.faviconMetaTags]);
}

const Article: React.FC<PageParams> = async ({ params }) => {
  const { post } = await getPageQuery<ArticleProps>(ArticleQuery, {
    variables: { slug: params.slug },
  });
  const { next, prev } = await getPageQuery<{
    next: { slug: string; title: string };
    prev: { slug: string; title: string };
  }>(GetNextArticles, {
    variables: {
      id: post.id,
      date: post.publishedAt ?? new Date().toISOString(),
    },
  });

  const jsonld: TechArticle = {
    "@type": "TechArticle",
    headline: post.title,
    author: post.authors.at(0)?.name,
    keywords: post.tags.join(" "),
    datePublished: post.publishedAt,
    description: getDescriptionTag(post.seo),
    url: `${process.env.VERCEL_ENV === "development" ? "http" : "https"}://${
      process.env.VERCEL_URL
    }/blog/${post.slug}`,
  };

  return (
    <>
      <Separator />
      <div className="mx-auto max-w-3xl flex-grow px-4 sm:px-6 xl:max-w-5xl xl:px-0">
        <Script type="application/ld+json" id={`jsonld-${post.id}`}>
          {JSON.stringify(jsonld)}
        </Script>
        <ScrollToTop comments={false} />
        <article className="mb-auto">
          <div className="xl:divide-y xl:divide-zinc-200">
            <header className="pt-6 xl:pb-6">
              <div className="space-y-1 text-center">
                <dl className="space-y-10">
                  <div>
                    <dt className="sr-only">Published on</dt>
                    <dd className="text-base font-medium leading-6 text-zinc-500">
                      <time dateTime={post.publishedAt ?? ""}>
                        {formatLocalDate(post.publishedAt)}
                      </time>
                    </dd>
                  </div>
                </dl>
                <div>
                  <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                    {post.title}
                  </h1>
                </div>
              </div>
            </header>
            <div
              className="divide-y divide-zinc-200 pb-8 xl:grid xl:grid-cols-4 xl:gap-x-6 xl:divide-y-0"
              style={{ gridTemplateRows: "auto 1fr" }}
            >
              <dl className="pb-10 pt-6 xl:border-b xl:border-zinc-200 xl:pt-11">
                <dt className="sr-only">Authors</dt>
                <dd>
                  <ul className="flex justify-center space-x-8 sm:space-x-12 xl:block xl:space-x-0 xl:space-y-8">
                    {post.authors.map((author, i) => (
                      <li className="flex items-center space-x-2" key={i}>
                        <Avatar>
                          <AvatarImage asChild src={author.avatar ?? ""}>
                            <Image
                              src={author.avatar ?? ""}
                              width={38}
                              height={38}
                              alt="avatar"
                            />
                          </AvatarImage>
                          <AvatarFallback>
                            <User2 />
                          </AvatarFallback>
                        </Avatar>
                        <dl className="whitespace-nowrap text-sm font-medium leading-5">
                          <dt className="sr-only">Name</dt>
                          <dd className="text-zinc-900">{author.name}</dd>
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
              </section>
              <section>
                <div className="divide-zinc-200 text-sm font-medium leading-5 xl:col-start-1 xl:row-start-2 xl:divide-y">
                  {post.tags ? (
                    <div className="py-4 xl:py-8">
                      <h2 className="text-xs uppercase tracking-wide text-zinc-500">
                        Tags
                      </h2>
                      <div className="flex flex-wrap gap-1">
                        {post.tags.map((tag, i) => (
                          <Badge variant="secondary" key={i}>
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
                {next || prev ? (
                  <div className="flex justify-between py-4 xl:block xl:space-y-8 xl:py-8">
                    {prev ? (
                      <div>
                        <h2 className="text-xs uppercase tracking-wide text-zinc-500">
                          Previous Article
                        </h2>
                        <div className="text-blue-500 hover:text-blue-600">
                          <Link href={`/blog/${prev.slug}`}>{prev.title}</Link>
                        </div>
                      </div>
                    ) : null}
                    {next ? (
                      <div>
                        <h2 className="text-xs uppercase tracking-wide text-zinc-500">
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
                  <Button asChild variant="ghost">
                    <Link href="/blog">
                      <ArrowLeft className="mr-2" /> Back
                    </Link>
                  </Button>
                </div>
              </section>
            </div>
          </div>
        </article>
      </div>
    </>
  );
};

export default Article;
