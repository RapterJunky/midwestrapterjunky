import type { GetStaticPathsContext, GetStaticPathsResult, GetStaticPropsContext, GetStaticPropsResult, NextPage } from "next";
import { type SeoOrFaviconTag, StructuredText } from "react-datocms";
import Image from "next/image";
import Link from "next/link";
import { HiArrowLeft } from "react-icons/hi";

import Navbar from "@components/Navbar";
import SiteTags from "@components/SiteTags";
import Footer from "@components/Footer";
import Tag from "@components/blog/tag";

import type { FullPageProps, StructuredContent } from "@lib/types";
import { formatDateArticle } from "@lib/utils/timeFormat";
import { renderBlock, renderInlineRecord } from "@lib/StructuredTextRules";
import { DATOCMS_Fetch } from "@lib/gql";

import ArticleQuery from "@query/queries/article";
import GetNextArticles from "@query/queries/next_articles";


interface ArticleProps extends FullPageProps {
    next: { slug: string; title: string; } | null;
    prev: { slug: string; title: string; } | null;
    post: {
        title: string;
        content: StructuredContent;
        publishedAt: string;
        prev: {
            slug: string;
            title: string;
        } | null;
        next: {
            slug: string;
            title: string;
        }
        authors: {
            avatar: string | null,
            name: string;
            social: {
                user: string;
                link: string;
            } | null;
        }[],
        seo: SeoOrFaviconTag[];
        slug: string;
        tags: string[];
        id: string;
    }
}

export const getStaticPaths = async (ctx: GetStaticPathsContext): Promise<GetStaticPathsResult> => {
    return {
        paths: [],
        fallback: "blocking"
    }
}

export const getStaticProps = async (ctx: GetStaticPropsContext): Promise<GetStaticPropsResult<ArticleProps>> => {

    const data = await DATOCMS_Fetch<ArticleProps>(ArticleQuery,{ 
        preview: ctx.preview,
        variables: {
            slug: ctx.params?.id
        } 
    });

    const extra = await DATOCMS_Fetch<{ next: ArticleProps["next"], prev: ArticleProps["prev"] }>(GetNextArticles,{
        preview: ctx.preview,
        variables: {
            id: data.post.id,
            date: data.post.publishedAt
        }
    });

    return {
        props: {
            ...data,
            ...extra,
            preview: ctx?.preview ?? false
        }
    }
}

const Article: NextPage<ArticleProps> = ({ navbar, _site, preview, post, next, prev }) => {
    return (
        <div className="flex flex-col h-full">
            <SiteTags tags={[_site.faviconMetaTags,post.seo]}/>
            <Navbar {...navbar} mode="none"/>
            <main className="flex-grow mx-auto max-w-3xl px-4 sm:px-6 xl:max-w-5xl xl:px-0">
                <article className="mb-auto">
                    <div className="xl:divide-y xl:divide-gray-200">
                        <header className="pt-6 xl:pb-6">
                            <div className="space-y-1 text-center">
                                <dl className="space-y-10">
                                    <div>
                                        <dt className="sr-only">Published on</dt>
                                        <dd className="text-base font-medium leading-6 text-gray-500">
                                            <time dateTime={post.publishedAt}>{formatDateArticle(post.publishedAt)}</time>
                                        </dd>
                                    </div>
                                </dl>
                                <div>
                                    <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-5xl md:leading-14">
                                        {post.title}
                                    </h1>
                                </div>
                            </div>
                        </header>
                        <div className="divide-y divide-gray-200 pb-8 xl:grid xl:grid-cols-4 xl:gap-x-6 xl:divide-y-0" style={{ gridTemplateRows: 'auto 1fr' }}>
                            <dl className="pt-6 pb-10 xl:border-b xl:border-gray-200 xl:pt-11">
                                <dt className="sr-only">Authors</dt>
                                <dd>
                                    <ul className="flex justify-center space-x-8 sm:space-x-12 xl:block xl:space-x-0 xl:space-y-8">
                                        {post.authors.map((author,i)=>(
                                            <li className="flex items-center space-x-2" key={i}>
                                                {author.avatar ? (
                                                    <Image src={author.avatar} width={38} height={38} alt="avatar" className="h-10 w-10 rounded-full"/>
                                                ) : null}
                                                <dl className="whitespace-nowrap text-sm font-medium leading-5">
                                                    <dt className="sr-only">Name</dt>
                                                    <dd className="text-gray-900">{author.name}</dd>
                                                    <dt className="sr-only">Social</dt>
                                                    <dd>
                                                        {author.social ? (
                                                            <Link className="text-teal-500 hover:text-teal-600" href={author.social.link}>{author.social.user}</Link>
                                                        ) : null}
                                                    </dd>
                                                </dl>
                                            </li>
                                        ))}
                                    </ul>
                                </dd>
                            </dl>
                            <section className="divide-y divide-gray-200 xl:col-span-3 xl:row-span-2 xl:pb-0">
                                <div className="prose max-w-none pt-10 pb-8 ">
                                    <StructuredText renderInlineRecord={renderInlineRecord} renderBlock={renderBlock} data={post.content}/>
                                </div>
                                { /* Comments section would go here. */ }
                            </section>
                            <section>
                                <div className="divide-gray-200 text-sm font-medium leading-5 xl:col-start-1 xl:row-start-2 xl:divide-y">
                                    {post.tags ? (
                                        <div className="py-4 xl:py-8">
                                            <h2 className="text-xs uppercase tracking-wide text-gray-500">Tags</h2>
                                            <div className="flex flex-wrap">
                                                {post.tags.map((tag,i)=>(
                                                    <Tag text={tag} key={i}/>
                                                ))}
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                                { next || prev ? (
                                    <div className="flex justify-between py-4 xl:block xl:space-y-8 xl:py-8">
                                        { prev ? (
                                            <div>
                                                <h2 className="text-xs uppercase tracking-wide text-gray-500">
                                                    Previous Article
                                                </h2>
                                                <div className="text-teal-500 hover:text-teal-600">
                                                    <Link href={`/blog/${prev.slug}`}>{prev.title}</Link>
                                                </div>
                                            </div>
                                        ) : null}
                                        { next ? (
                                            <div>
                                                <h2 className="text-xs uppercase tracking-wide text-gray-500">
                                                    Next Article
                                                </h2>
                                                <div className="text-teal-500 hover:text-teal-600">
                                                    <Link href={`/blog/${next.slug}`}>{next.title}</Link>
                                                </div>                                                
                                            </div>
                                        ) : null}
                                    </div>
                                ) : null }
                                <div className="pt-4 xl:pt-8">
                                    <Link href="/blog"
                                    className="text-teal-500 hover:text-teal-600 flex items-center">
                                    <HiArrowLeft/> Back to the blog
                                    </Link>
                                </div>
                            </section>
                        </div>
                    </div>
                </article>
            </main>
            <div className="h-20">
                <Footer/>
            </div>
        </div>
    );
}

export default Article;