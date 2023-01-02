import type { GetStaticPropsResult, GetStaticPropsContext, NextPage } from "next";

import Navbar from "@components/Navbar";
import SiteTags from "@components/SiteTags";
import Footer from "@components/Footer";
import ExitPreview from "@components/ExitPreview";

import { DATOCMS_Fetch } from "@lib/gql";
import { formatDateArticle } from "@lib/utils/timeFormat";
import GenericPageQuery from "@query/queries/generic";

import type { FullPageProps } from "@lib/types";
import Link from "next/link";
import { HiArrowRight } from "react-icons/hi";
import Tag from "@components/blog/tag";

interface BlogLatestProps extends FullPageProps {
    posts: {
        slug: string;
        publishedAt: string;
        title: string;
        summary: string;
        tags: string[]
    }[]
}

const MAX_DISPLAY = 5;

//https://github.com/timlrx/tailwind-nextjs-starter-blog/blob/master/components/Tag.js

export const getStaticProps = async (ctx: GetStaticPropsContext): Promise<GetStaticPropsResult<BlogLatestProps>> => {

    const data = await DATOCMS_Fetch<any>(GenericPageQuery,{ preview: ctx.preview });
    
    return {
        props: {
            ...data,
            posts: [
                {
                    publishedAt: "2021-08-07T15:32:14.000Z",
                    slug: "test",
                    summary: "An overview of the new features released in v1 - code block copy, multiple authors, frontmatter layout and more",
                    tags: ["next-js","tailwind","guide"],
                    title: "New features in v1"
                },
                {
                    publishedAt: "2021-08-07T15:32:14.000Z",
                    slug: "test2",
                    summary: "An overview of the new features released in v1 - code block copy, multiple authors, frontmatter layout and more",
                    tags: ["next-js","tailwind","guide"],
                    title: "New features in v1"
                }
            ],
            preview: ctx?.preview ?? false
        }
    }
}

const BlogLatest: NextPage<BlogLatestProps> = (props) => {
    return (
        <div className="h-full flex flex-col">
            <SiteTags tags={[]}/>
            <header>
                <Navbar {...props.navbar} mode="none"/>
            </header>
            <main className="flex-grow h-full flex flex-col mx-auto max-w-3xl px-4 sm:px-6 xl:max-w-5xl xl:px-0 antialiased">
                <div className="divide-y divide-gray-200">
                    <div className="space-y-2 pt-6 pb-8 md:space-y-5">
                        <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
                            Latest
                        </h1>
                        <p className="text-lg leading-7 text-gray-500">
                            A blog created with Next.js and Tailwind.css
                        </p>
                    </div>
                    <ul className="divide-y divide-gray-200">
                        {props.posts.map(post=>(
                            <li key={post.slug} className="py-12">
                                <article>
                                    <div className="space-y-2 xl:grid xl:grid-cols-4 xl:items-baseline xl:space-y-0">
                                        <dl>
                                            <dt className="sr-only">Published on</dt>
                                            <dd className="text-base font-medium leading-6 text-gray-500">
                                                <time dateTime={post.publishedAt}>{formatDateArticle(post.publishedAt)}</time>
                                            </dd>
                                        </dl>
                                        <div className="space-y-5 xl:col-span-3">
                                            <div className="space-y-6">
                                                <div>
                                                    <h2 className="text-2xl font-bold leading-8 tracking-tight">
                                                        <Link className="text-gray-900" href={`/blog/${post.slug}`}>{post.title}</Link>
                                                    </h2>
                                                    <div className="flex flex-wrap">
                                                        {post.tags.map((tag,i)=>(
                                                            <Tag text={tag} key={i}/>
                                                        ))}
                                                    </div>
                                                </div>
                                                <summary className="prose max-w-none text-gray-500">
                                                    {post.summary}
                                                </summary>
                                            </div>
                                            <div className="text-base font-medium leading-6">
                                                <Link className="text-teal-500 hover:text-teal-600 flex items-center" aria-label={`Read "${post.title}"`} href={`/blog/${post.slug}`}>
                                                    Read more 
                                                    <HiArrowRight/>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="flex justify-end text-base font-medium leading-6">
                    <Link
                        href="/blog"
                        className="text-teal-500 hover:text-teal-600 flex items-center gap-1"
                        aria-label="all posts"
                    >
                        All Posts <HiArrowRight/>
                    </Link>
                </div>
            </main>
            <Footer/>
            { props.preview ? <ExitPreview/> : null }
        </div>
    );
}

export default BlogLatest;