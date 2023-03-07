import type { GetStaticPropsResult, GetStaticPropsContext, NextPage, GetStaticPathsResult } from 'next';
import Link from 'next/link';
import useSWR from 'swr';
import { useState } from 'react';
import { useDebounce } from "use-debounce";
import type { FullPageProps, Paginate } from '@type/page';

import SiteTags from '@components/SiteTags';
import Navbar from '@components/Navbar';
import ExitPreview from '@components/ExitPreview';
import Footer from '@components/Footer';

import prisma, { type ThreadPost, type Thread, type User } from '@api/prisma';
import { DatoCMS } from '@api/gql';
import GenericPageQuery from '@query/queries/generic';



interface Props extends FullPageProps {
    thread: Thread
}

export const getStaticPaths = (): GetStaticPathsResult => {
    return {
        paths: [],
        fallback: "blocking"
    }
}

export const getStaticProps = async (ctx: GetStaticPropsContext): Promise<GetStaticPropsResult<Props>> => {
    try {
        const thread = await prisma.thread.findUniqueOrThrow({
            where: {
                id: parseInt(ctx.params?.thread as string) ?? -1
            }
        });

        const props = await DatoCMS<Props>(GenericPageQuery, {
            preview: ctx.preview,
        });

        return {
            props: {
                ...props,
                thread,
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

const Thread: NextPage<Props> = ({ _site, navbar, preview, thread }) => {
    const [query, setQuery] = useState<string>("");
    const [debouncedQuery] = useDebounce(query, 1000);
    const { data, isLoading, error } = useSWR<Paginate<ThreadPost & { owner: User }>, Response, string>(`/api/threads?thread=${thread.id}&page=1&search=${encodeURIComponent(debouncedQuery)}`, (url) => fetch(url).then(value => value.json()));

    return (
        <div className="flex flex-col h-full">
            <SiteTags tags={[_site.faviconMetaTags, [{ tag: "title", content: `Thread ${thread.name} - Midwest Raptor Junkies` }]]} />
            <header>
                <Navbar {...navbar} mode="none" />
            </header>
            <main className="flex-1 flex flex-col items-center gap-2">
                <div className="container mt-6 flex justify-start w-full">
                    <h1 className="font-bold text-4xl">Thread - {thread.name}</h1>
                </div>
                <div className='flex container mt-4 shadow p-2'>
                    <input onChange={(ev) => setQuery(ev.target.value)} value={query} type="text" className="rounded-sm" placeholder='Search' />
                    <div className="mr-auto">

                    </div>
                    <Link href={{ pathname: "/threads/[thread]/new", query: { thread: thread.id } }} className='inline-block rounded bg-indigo-600 px-8 py-3 text-sm font-medium text-white transition hover:scale-110 hover:shadow-xl focus:outline-none focus:ring active:bg-indigo-500'>Create Post</Link>
                </div>
                <div className="container flex flex-col gap-4 mt-4">
                    <hr className='w-full' />
                    {isLoading ? null : data?.result.map((value) => (
                        <div key={value.id} className="flex gap-2 items-center shadow p-2">
                            <div className='flex flex-col items-center'>
                                <img className="h-9 w-9 rounded-full" src={value.owner.image ?? ""} alt="avatar" />
                                <span className="text-xs text-center">{value.owner.name}</span>
                            </div>
                            <div className="mr-auto">
                                <h1 className="font-bold underline">{value.name}</h1>
                                <span className="text-sm text-gray-600">{new Date(value.created).toLocaleDateString("en-us", { weekday: "long", year: "numeric", month: "long", day: "numeric", })}</span>
                            </div>
                            <Link href={{ pathname: "/threads/[thread]/post/[id]", query: { thread: thread.id, id: value.id } }} className='inline-block rounded bg-indigo-600 px-8 py-3 text-sm font-medium text-white transition hover:scale-110 hover:shadow-xl focus:outline-none focus:ring active:bg-indigo-500'>View</Link>
                        </div>
                    ))}
                </div>
            </main>
            <Footer />
            {preview ? <ExitPreview /> : null}
        </div>
    );
}

export default Thread;