import type { GetStaticPathsResult, GetStaticPropsContext, GetStaticPropsResult } from "next";
import { serialize } from 'superjson';
import Image from 'next/image';
import GenericPageQuery from "@/gql/queries/generic";
import { fetchCachedQuery } from "@lib/cache";
import { FullPageProps, NextPageWithProvider } from "@/types/page";
import { z } from 'zod';
import prisma from '@api/prisma';
import Navbar from "@components/layout/Navbar";
import Footer from "@components/layout/Footer";
import { HiLockClosed } from "react-icons/hi";
import { FaThumbtack } from "react-icons/fa";
import { StructuredText } from "react-datocms/structured-text";
import Comments from "@components/thread/Comments";
import SiteTags from "@components/SiteTags";
import genericSeoTags from "@lib/utils/genericSeoTags";
import TagList from "@components/community/TagList";
import { renderBlock, renderInlineRecord } from "@lib/structuredTextRules";
import { PostProvider } from "@/hooks/usePost";
import { formatLocalDate } from "@lib/utils/timeFormat";
import TopicActions from "@/components/community/TopicActions";
import TopicsList from "@/components/community/TopicsList";

interface Props extends FullPageProps {
    post: {
        _count: {
            likes: number
        }
        id: string;
        name: string;
        created: string;
        ownerId: string;
        tags?: string[],
        owner: {
            image: string;
            name: string;
        }
        pinned: boolean;
        locked: boolean;
        content: PrismaJson.Dast,
        threadId: number;
    }
}

const idCheck = z.object({
    slug: z.string().uuid().nonempty()
});

export const getStaticPaths = (): GetStaticPathsResult => {
    return {
        paths: [],
        fallback: "blocking"
    }
}

export const getStaticProps = async ({ preview, params }: GetStaticPropsContext): Promise<GetStaticPropsResult<Props>> => {
    const check = idCheck.safeParse(params);
    if (!check.success) return {
        notFound: true
    }

    const post = await prisma.threadPost.findUnique({
        where: {
            id: check.data.slug
        },
        include: {
            _count: {
                select: {
                    likes: true
                }
            },
            owner: {
                select: {
                    image: true,
                    name: true
                }
            }
        }
    });

    if (!post) return {
        notFound: true
    }

    const props = await fetchCachedQuery<FullPageProps>(
        "GenericPage",
        GenericPageQuery
    );

    const { json } = serialize(post);

    return {
        props: {
            ...props,
            post: json as Props["post"],
            preview: preview ?? false
        }
    };
};

const CommunityPost: NextPageWithProvider<Props> = ({ navbar, _site, post }) => {
    return (
        <div className="flex flex-col h-full">
            <SiteTags tags={[
                _site.faviconMetaTags,
                genericSeoTags({
                    title: post.name,
                    description: post.name,
                })
            ]} />
            <Navbar {...navbar} mode="only-scroll" />
            <PostProvider postId={post.id}>
                <main className="flex-1 mt-20 flex flex-col items-center">
                    <div className="container max-w-4xl my-4 divide-y-2 px-4">
                        <header className="mb-4">
                            <h1 className="font-bold flex items-center text-xl md:text-3xl mb-1 gap-1">
                                {post.locked ? (
                                    <span className="text-neutral-500">
                                        <HiLockClosed />
                                    </span>
                                ) : null}
                                {post.pinned ? (
                                    <span className="text-neutral-500">
                                        <FaThumbtack />
                                    </span>
                                ) : null}
                                {post.name}
                            </h1>
                            <TagList tags={post.tags ?? []} />
                        </header>
                        <div className="flex w-full pt-2 mb-4">
                            <div className="px-2 w-full">
                                <div className="flex gap-2">
                                    <div>
                                        <Image className="rounded-full" src={post.owner.image} alt="avatar" width={40} height={50} />
                                    </div>
                                    <div className="flex w-full justify-between mb-2 text-neutral-600">
                                        <div className="font-bold">{post.owner.name}</div>
                                        <div>{formatLocalDate(post.created, undefined, { day: "numeric", month: "short", year: "numeric" })}</div>
                                    </div>
                                </div>
                                <article className="prose py-2 mb-4 max-w-none">
                                    <StructuredText renderBlock={renderBlock} renderInlineRecord={renderInlineRecord} data={post.content} />
                                </article>
                                <TopicActions likes={post._count.likes} postId={post.id} ownerId={post.ownerId} />
                            </div>
                        </div>
                        <Comments />
                    </div>
                    <div className="max-w-5xl w-full mb-4 px-4">
                        <h1 className="font-bold text-xl">Suggested Topics</h1>
                        <TopicsList mode="suggest" tags={post.tags} ignore={post.id} />
                    </div>
                </main>
            </PostProvider>
            <Footer />
        </div>
    );
}

export default CommunityPost;