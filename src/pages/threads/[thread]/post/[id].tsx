import type { GetStaticPropsResult, GetStaticPropsContext, NextPage, GetStaticPathsResult } from 'next';
import { StructuredText } from 'react-datocms/structured-text';
import { z } from 'zod';
import type { FullPageProps } from '@type/page';
import { DatoCMS } from '@api/gql';
import GenericPageQuery from '@query/queries/generic';
import prisma, { type User, type Thread, type ThreadPost } from '@api/prisma';
import SiteTags from '@components/SiteTags';
import Navbar from '@components/layout/Navbar';
import Footer from '@components/layout/Footer';
import ExitPreview from '@components/ExitPreview';
import { fetchCacheData } from '@lib/cache';
import Link from 'next/link';
import Comments from '@components/thread/Comments';
import { formatLocalDate } from '@lib/utils/timeFormat';
import { renderBlock } from '@lib/structuredTextRules';
import Image from 'next/image';

interface Props extends FullPageProps {
    post: Pick<ThreadPost, "created" | "name" | "id" | "content"> & {
        owner: Pick<User, "id" | "name" | "image">;
        thread: Thread
    }
}

export const getStaticPaths = (): GetStaticPathsResult => {
    return {
        paths: [],
        fallback: "blocking"
    }
}

export const getStaticProps = async (ctx: GetStaticPropsContext): Promise<GetStaticPropsResult<Props>> => {
    try {
        const id = z.string().parse(ctx.params?.id);

        const post = await prisma.threadPost.findUniqueOrThrow({
            where: {
                id
            },
            select: {
                created: true,
                name: true,
                content: true,
                id: true,
                thread: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                owner: {
                    select: {
                        image: true,
                        name: true,
                        id: true,
                    }
                }
            }
        });

        const props = await fetchCacheData<Omit<Props, "post">>("fav-nav", () => DatoCMS(GenericPageQuery, {
            preview: ctx.preview,
        }));

        return {
            props: {
                ...props,
                post,
                preview: ctx?.preview ?? false
            }
        }
    } catch (error) {
        console.error(error);
        return {
            notFound: true
        }
    }
}

const doc = [
    {
        "type": "heading",
        "level": 1,
        "children": [
            {
                "type": "span",
                "marks": [],
                "value": "This is a level one heading!"
            }
        ]
    },
    {
        "type": "heading",
        "level": 2,
        "children": [
            {
                "type": "span",
                "marks": [],
                "value": "This is a level two heading!"
            }
        ]
    },
    {
        "item": "119716320",
        "type": "block"
    },
    {
        "type": "heading",
        "level": 3,
        "children": [
            {
                "type": "span",
                "marks": [],
                "value": "This is a level three heading!"
            }
        ]
    },
    {
        "type": "heading",
        "level": 4,
        "children": [
            {
                "type": "span",
                "marks": [],
                "value": "This is a level four heading!"
            }
        ]
    },
    {
        "type": "heading",
        "level": 5,
        "children": [
            {
                "type": "span",
                "marks": [],
                "value": "This is a level five heading!"
            }
        ]
    },
    {
        "type": "heading",
        "level": 6,
        "children": [
            {
                "type": "span",
                "marks": [],
                "value": "This is a level six heading!"
            }
        ]
    },
    {
        "type": "span",
        "value": "Im a span"
    },
    {
        "type": "paragraph",
        "children": [
            {
                "type": "span",
                "value": "This is a "
            },
            {
                "type": "span",
                "marks": ["strong"],
                "value": "paragraph!"
            }
        ]
    },
    {
        "type": "list",
        "style": "bulleted",
        "children": [
            {
                "type": "listItem",
                "children": [{
                    "type": "paragraph",
                    "children": [
                        {
                            "type": "span",
                            "value": "this is a unordered list!"
                        }
                    ]
                }],
            }
        ]
    },
    {
        "type": "list",
        "style": "numbered",
        "children": [
            {
                "type": "listItem",
                "children": [{
                    "type": "paragraph",
                    "children": [
                        {
                            "type": "span",
                            "value": "this is a ordered list!"
                        }
                    ]
                }],
            }
        ]
    },
    {
        "type": "thematicBreak"
    },
    {
        "type": "link",
        "url": "https://www.datocms.com/",
        "meta": [
            { "id": "rel", "value": "nofollow" },
            { "id": "target", "value": "_blank" }
        ],
        "children": [
            {
                "type": "span",
                "value": "Link"
            }
        ]
    },
    {
        "type": "blockquote",
        "attribution": "Attribution",
        "children": [
            {
                "type": "paragraph",
                "children": [
                    {
                        "type": "span",
                        "value": "Im a quote"
                    }
                ]
            }
        ]
    }
]

const ExampleDast: any = {
    links: [],
    blocks: [
        {
            "id": "119716320",
            "__typename": "ImageRecord",
            "content": {
                "responsiveImage": {
                    "src": "https://www.datocms-assets.com/77949/1668115755-fg5_2100x.webp",
                    "sizes": "(max-width: 960px) 100vw, 960px",
                    "alt": null,
                    "width": 960,
                    "height": 720
                }
            }
        }
    ],
    value: {
        "schema": "dast",
        "document": {
            "type": "root",
            "children": doc
        }
    }
};

const Post: NextPage<Props> = ({ preview, _site, navbar, post }) => {
    return (
        <div className="flex flex-col h-full">
            <SiteTags tags={[_site.faviconMetaTags, [{ tag: "title", content: `Post ${post.name} - Midwest Raptor Junkies` }]]} />
            <header>
                <Navbar {...navbar} mode="none" />
            </header>
            <main className="flex-1 flex flex-col items-center gap-2">
                <div className='flex items-center gap-4 w-full max-w-5xl mt-5'>
                    <Image src={post.owner.image ?? ""} alt="avatar" className="rounded-full" width={48} height={48} />
                    <div>
                        <div className="font-bold text-3xl">{post.name}</div>
                        <span className="text-sm">By <span className="text-red-500">{post.owner.name}</span>, in <Link href={`/threads/${post.thread.id}`} className='text-red-500 underline active:text-red-700'>{post.thread.name}</Link> on {formatLocalDate(post.created, "en-us", { weekday: "short" })} </span>
                    </div>
                </div>
                <hr className="w-full max-w-5xl" />
                <div className="w-full max-w-5xl p-2 prose min-h-[320px] prose-blockquote:last-of-type:">
                    <StructuredText renderBlock={renderBlock} data={ExampleDast} />
                </div>
                <div className="sm:max-w-5xl w-full overflow-hidden">
                    <Comments post={post.id} />
                </div>
            </main>
            <div className="h-20 mt-4">
                <Footer />
            </div>
            {preview ? <ExitPreview /> : null}
        </div>
    );
}

export default Post;