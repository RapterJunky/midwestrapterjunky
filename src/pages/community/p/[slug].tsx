import type { GetStaticPathsResult, GetStaticPropsContext, GetStaticPropsResult, NextPage } from "next";
import { serialize } from 'superjson';
import Image from 'next/image';
import GenericPageQuery from "@/gql/queries/generic";
import { fetchCachedQuery } from "@/lib/cache";
import { FullPageProps } from "@/types/page";
import { z } from 'zod';
import prisma from '@api/prisma';
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { HiFlag, HiHeart, HiLink, HiLockClosed } from "react-icons/hi";
import { FaThumbtack } from "react-icons/fa";
import { StructuredText } from "react-datocms/structured-text";
import Comments from "@/components/thread/Comments";
import SiteTags from "@/components/SiteTags";
import genericSeoTags from "@/lib/utils/genericSeoTags";
import TagList from "@/components/community/TagList";
import TopicTable from "@/components/community/TopicTable";

interface Props extends FullPageProps {
    post: {
        id: string;
        name: string;
        created: string;
        ownerId: string;
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

const TEST: PrismaJson.Dast = {
    value: {
        schema: "dast",
        document: {
            type: "root",
            children: [
                {
                    type: "paragraph", children: [
                        {
                            "type": "span",
                            value: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sit deserunt enim soluta praesentium laudantium reprehenderit est ipsa iusto porro rerum, voluptatibus quae quibusdam nisi tenetur dicta similique in pariatur atque!"
                        }
                    ]
                }
            ]
        }
    }
}

const CommunityPost: NextPage<Props> = ({ navbar, _site, post }) => {
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
            <main className="flex-1 mt-20 flex flex-col items-center">
                <div className="container max-w-3xl my-4 divide-y-2">
                    <header className="mb-4">
                        <h1 className="font-bold flex items-center text-3xl mb-1 gap-1">
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
                        <TagList tags={["TAGS"]} />
                    </header>
                    <div className="flex w-full pt-2 mb-4">
                        <div>
                            <Image className="rounded-full" src={post.owner.image} alt="avatar" width={40} height={50} />
                        </div>
                        <div className="px-2 w-full">
                            <div className="flex w-full justify-between mb-2 text-neutral-600">
                                <div className="font-bold">{post.owner.name}</div>
                                <div>{new Date(post.created).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}</div>
                            </div>
                            <article className="prose py-2 mb-4">
                                <StructuredText data={TEST} />
                            </article>
                            <div className="p-0.5 flex justify-end gap-1 text-neutral-600">
                                <button className="p-1" title="like this post">
                                    <HiHeart className="h-6 w-6" />
                                </button>
                                <button className="p-1" title="privately flag this post for attention or send a private notification about it">
                                    <HiFlag className="h-6 w-6" />
                                </button>
                                <button className="p-1" title="share a link to this post">
                                    <HiLink className="h-6 w-6" />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div>
                        <Comments post={post.id} />
                    </div>
                </div>
                <div className="max-w-5xl w-full mb-4">
                    <h1 className="font-bold text-xl">Suggested Topics</h1>
                    <TopicTable>
                        <tbody className="divide-y">
                            <tr>
                                <td className="p-2">
                                    <div className="font-medium text-lg mb-1">Topic Title</div>
                                    <TagList tags={["TAG"]} />
                                </td>
                                <td className="text-center font-medium">
                                    399
                                </td>
                                <td className="text-center font-medium">
                                    3 days ago
                                </td>
                            </tr>
                        </tbody>
                    </TopicTable>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default CommunityPost;