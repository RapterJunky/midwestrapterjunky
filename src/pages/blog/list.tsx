import type { GetStaticPropsContext, GetStaticPropsResult, NextPage } from "next";
import type { SeoOrFaviconTag } from "react-datocms";
import Link from "next/link";
import { useState } from "react";
import useSWR from 'swr';

import type { FullPageProps } from "@lib/types";
import { DATOCMS_Fetch } from "@lib/gql";
import { formatDateArticle } from "@lib/utils/timeFormat";
import { getDescriptionTag } from "@lib/utils/description";

import Navbar from "@components/Navbar";
import SiteTags from "@components/SiteTags";
import Tag from "@components/blog/tag";

import GenericPageQuery from "@query/queries/generic";
import Footer from "@components/Footer";
import Pagination from "@components/blog/Pagination";

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
    }
}

export const getStaticProps = async (ctx: GetStaticPropsContext): Promise<GetStaticPropsResult<BlogListProps>> => {

    const data = await DATOCMS_Fetch<BlogListProps>(GenericPageQuery,{ 
        preview: ctx.preview,
        variables: {
            slug: ctx.params?.id
        } 
    });

    return {
        props: {
            ...data,
            preview: ctx?.preview ?? false
        }
    }
}

const BlogList: NextPage<BlogListProps> = ({ navbar, _site }) => {
    const [pageIndex,setPageIndex] = useState<number>(0);
    const { data,error, isLoading } = useSWR<Post,Response>(`/api/blog?page=${pageIndex}`,(uri)=>fetch(uri).then(value=>value.json()));

    return (
        <div className="h-full flex flex-col">
            <SiteTags tags={[_site.faviconMetaTags, [ { tag: "title", content: "Articles" } ]]}/>
            <header>
                <Navbar {...navbar} mode="none"/>
            </header>
            <main className="flex-grow flex flex-col mx-auto max-w-3xl px-4 sm:px-6 xl:max-w-5xl xl:px-0">
                <div className="divide-y divide-gray-200">
                    <div className="space-y-2 pt-6 pb-8 md:space-y-5">
                        <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
                            All Articles
                        </h1>
                    </div>
                    <ul>
                        { isLoading ? (
                            <div className="w-full flex flex-col justify-center mx-auto p-4 my-4 flex-grow items-center">
                                <div className="spinner-border animate-spin inline-block w-12 h-12 border-4 rounded-full" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <h3 className="font-sans p-3"> Loading...</h3>
                            </div>
                        ) : (
                            <>
                                { error ? (
                                    <div className="flex justify-center items-center flex-col">
                                        <h1 className="font-bold text-5xl mt-4">Opps</h1>
                                        <p className="py-4">Sorry, an unexpected error occurred. Try reloading the page.</p>
                                        <span className="text-gray-500 text-sm">{error?.statusText ?? ""}</span>
                                    </div>
                                ) : (
                                <>
                                    { !data?.posts.length ? "No posts found." : <>{data.posts.map((post)=>(
                                        <li key={post.id} className="py-4">
                                            <article>
                                                <dl>
                                                    <dt className="sr-only">Published on</dt>
                                                    <dd className="text-base font-medium leading-6 text-gray-500">
                                                    <time dateTime={post.publishedAt ?? new Date().toISOString()}>{formatDateArticle(post.publishedAt ?? new Date().toISOString())}</time>
                                                    </dd>
                                                </dl>
                                                <div className="space-y-3 xl:col-span-3">
                                                <div>
                                                    <h3 className="text-2xl font-bold leading-8 tracking-tight">
                                                        <Link href={`/blog/${post.slug}`} className="text-gray-900">
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
                                    ))}</> }
                                </>
                                ) }
                            </>
                        ) }
                    </ul>
                </div>
                <Pagination setIndex={setPageIndex} currentPage={pageIndex} isLoading={isLoading} total={data?.totalArticles.count ?? 0} />
            </main>
            <div className="h-20">
                <Footer/>
            </div>
        </div>
    );
}

export default BlogList;