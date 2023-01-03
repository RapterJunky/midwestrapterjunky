import type { GetStaticPathsContext, GetStaticPathsResult, GetStaticPropsContext, GetStaticPropsResult, NextPage } from "next";
import type { FullPageProps } from "@lib/types";
import { DATOCMS_Fetch } from "@lib/gql";
import GenericPageQuery from "@query/queries/generic";
import Navbar from "@components/Navbar";
import SiteTags from "@components/SiteTags";
import Footer from "@components/Footer";
import Link from "next/link";
import { formatDateArticle } from "@lib/utils/timeFormat";

interface ArticleProps extends FullPageProps {
    post: {
        title: string;
    }
}

export const getStaticPaths = async (ctx: GetStaticPathsContext): Promise<GetStaticPathsResult> => {
    return {
        paths: [],
        fallback: "blocking"
    }
}

export const getStaticProps = async (ctx: GetStaticPropsContext): Promise<GetStaticPropsResult<ArticleProps>> => {

    const data = await DATOCMS_Fetch<ArticleProps>(GenericPageQuery,{ 
        preview: ctx.preview,
        variables: {
            page: ""
        } 
    });

    if(!("post" in data)) {
        //@ts-ignore
        data["post"] = {
            title: (ctx.params?.id as string) ?? "Example Page"
        }
    }

    return {
        props: {
            ...data,
            preview: ctx?.preview ?? false
        }
    }
}

const Article: NextPage<ArticleProps> = ({ navbar, _site, preview, post }) => {
    return (
        <div className="flex flex-col h-full">
            <SiteTags tags={[_site.faviconMetaTags]}/>
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
                                            <time dateTime={"2021-05-02T00:00:00.000Z"}>{formatDateArticle("2021-05-02T00:00:00.000Z")}</time>
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
                        <div>
                            <dl>
                                <dt></dt>
                                <dd>
                                    <ul></ul>
                                </dd>
                            </dl>
                            <div>
                                <div></div>
                                <div>
                                    <Link href=""></Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </article>
            </main>
            <Footer/>
        </div>
    );
}

export default Article;