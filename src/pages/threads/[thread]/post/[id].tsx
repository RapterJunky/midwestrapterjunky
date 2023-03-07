import type { GetStaticPropsResult, GetStaticPropsContext, NextPage, GetStaticPathsResult } from 'next';
import { StructuredText } from 'react-datocms/structured-text';
import useSWR from 'swr';
import { z } from 'zod';
import type { FullPageProps, Paginate } from '@type/page';
import { DatoCMS } from '@api/gql';
import GenericPageQuery from '@query/queries/generic';
import prisma, { User, Thread, ThreadPost, Comment } from '@api/prisma';
import SiteTags from '@components/SiteTags';
import Navbar from '@components/Navbar';
import Footer from '@components/Footer';
import ExitPreview from '@components/ExitPreview';
import { HiArrowRight, HiDotsHorizontal, HiDotsVertical } from 'react-icons/hi';

interface Props extends FullPageProps {
    post: Omit<ThreadPost, "created"> & {
        owner: User;
        thread: Thread;
        created: string
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
                id: true,
                thread: {
                    select: {
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

        const props = await DatoCMS<Props>(GenericPageQuery, {
            preview: ctx.preview,
        });

        return {
            props: {
                ...props,
                post: JSON.parse(JSON.stringify(post)),
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

const Post: NextPage<Props> = ({ preview, _site, navbar, post }) => {
    const { data, isLoading, error } = useSWR<Paginate<Comment & { owner: User }>, Response>(`/api/threads/comments?post=${post.id}&page=1`, (url) => fetch(url).then(res => res.json()));

    return (
        <div className="flex flex-col h-full">
            <SiteTags tags={[_site.faviconMetaTags, [{ tag: "title", content: `Post ${post.name} - Midwest Raptor Junkies` }]]} />
            <header>
                <Navbar {...navbar} mode="none" />
            </header>
            <main className="flex-1 flex flex-col items-center gap-2">
                <div className='flex items-center gap-4 w-full max-w-5xl mt-5'>
                    <img src={post.owner.image ?? ""} alt="avatar" className='w-12 h-12 rounded-full' />
                    <div>
                        <h1 className="font-bold text-xl">{post.name}</h1>
                        <div className="text-sm">By <span className="text-red-500">{post.owner.name}</span>, in <span className='text-red-500'>{post.thread.name}</span></div>
                    </div>
                </div>
                <hr className="w-full max-w-5xl" />
                <div className="w-full max-w-5xl p-2 h-40 prose">
                    <StructuredText data={{ type: "root", children: [{ type: "paragraph", children: [{ type: "span", value: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nihil ratione sint eius, reprehenderit totam eum nesciunt sed aspernatur, corrupti odio laudantium explicabo suscipit dolor error eveniet at aperiam impedit perferendis." }] }] }} />
                </div>
                <hr className="w-full max-w-5xl" />
                <div className='flex flex-col items-start w-full max-w-5xl'>
                    <h2>Comments</h2>

                    <form className='flex w-full justify-between gap-6 my-4'>
                        <img src={post.owner.image ?? ""} alt="avatar" className='w-12 h-12 rounded-full' />
                        <input type="text" className="mt-0 block w-full px-0.5 border-0 border-b-2 border-gray-200 focus:ring-0 focus:border-black" placeholder='Add a comment' />
                        <button type="submit">
                            <HiArrowRight />
                        </button>
                    </form>
                    <hr className='w-full' />
                    <span className="my-2">2 Comments</span>
                    <ul className='w-full'>
                        {error ? (error.status) : null}
                        {isLoading ? null : data?.result.map(value => (
                            <li key={value.id} className='flex mt-4'>
                                <div className='flex flex-col gap-2'>
                                    <div className='flex gap-2'>
                                        <img src={value.owner?.image ?? ""} alt="avatar" className='w-12 h-12 rounded-full' />
                                        <div>
                                            <h4 className="font-bold">{value.owner.name}</h4>
                                            <span className="text-sm">{new Date(value.created).toLocaleDateString("en-us", {})}</span>
                                        </div>
                                    </div>
                                    <div className="prose text-sm max-w-none ml-14">
                                        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nihil ratione sint eius, reprehenderit totam eum nesciunt sed aspernatur, corrupti odio laudantium explicabo suscipit dolor error eveniet at aperiam impedit perferendis.
                                    </div>
                                </div>
                                <div className="ml-auto flex gap-2 items-start">
                                    <button>
                                        <HiDotsVertical className="h-6 w-6" />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

            </main>
            <Footer />
            {preview ? <ExitPreview /> : null}
        </div>
    );
}

export default Post;