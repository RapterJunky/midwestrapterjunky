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

const CommunityPost: NextPage<Props> = ({ navbar, preview, _site, post }) => {
    return (
        <div className="flex flex-col h-full">
            <Navbar {...navbar} mode="only-scroll" />
            <main className="flex-1 mt-20 flex justify-center">
                <div className="container max-w-3xl mt-4 divide-y-2">
                    <div className="mb-4">
                        <h1 className="font-bold flex items-center text-2xl mb-1"> {post.locked ? <HiLockClosed /> : null} {post.pinned ? (<FaThumbtack />) : null}  {post.name}</h1>
                        <div className="flex flex-wrap gap-2">
                            <span className="px-1 py-0.5 bg-emerald-400 text-white rounded-sm">TAG</span>
                        </div>
                    </div>
                    <div className="flex w-full pt-2 mb-4">
                        <div>
                            <Image className="rounded-full" src={post.owner.image} alt="avatar" width={40} height={50} />
                        </div>
                        <div className="px-2 w-full">
                            <div className="flex w-full justify-between mb-4 text-neutral-600">
                                <div className="font-bold">{post.owner.name}</div>
                                <div>{new Date(post.created).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}</div>
                            </div>
                            <article className="prose py-2">
                                <StructuredText data={TEST} />
                            </article>
                            <div className="p-0.5 flex justify-end gap-1 text-neutral-600">
                                <button className="p-1">
                                    <HiFlag className="h-5 w-5" />
                                </button>
                                <button className="p-1">
                                    <HiLink className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div>
                        <Comments post={post.id} />
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default CommunityPost;