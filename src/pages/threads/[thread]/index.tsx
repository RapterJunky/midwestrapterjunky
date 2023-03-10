import type { GetStaticPropsResult, GetStaticPropsContext, NextPage, GetStaticPathsResult } from 'next';
import Link from 'next/link';
import useSWR from 'swr';
import { useState } from 'react';
import { useDebounce } from "use-debounce";
import type { FullPageProps, Paginate } from '@type/page';

import SiteTags from '@components/SiteTags';
import Navbar from '@components/layout/Navbar';
import ExitPreview from '@components/ExitPreview';
import Footer from '@components/layout/Footer';

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
    const [page, setPage] = useState<number>(1);
    const [debouncedQuery] = useDebounce(query, 1000);
    const { data, isLoading, error } = useSWR<Paginate<ThreadPost & { owner: User }>, Response, string>(`/api/threads/post?thread=${thread.id}&page=${page}&search=${encodeURIComponent(debouncedQuery)}`, (url) => fetch(url).then(value => value.json()));

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
                <div className='flex flex-col gap-2 sm:flex-row container justify-between w-full mt-4 p-2'>
                    <input onChange={(ev) => setQuery(ev.target.value)} value={query} type="text" className="form-input mt-1 block rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" placeholder='Search' />
                    <Link href={{ pathname: "/threads/[thread]/new", query: { thread: thread.id } }} className='flex items-center justify-center rounded bg-primary px-6 pt-2.5 pb-2 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)]'>Create Post</Link>
                </div>
                <div className="container flex flex-col gap-4 mt-4 flex-1">
                    <hr className='w-full' />
                    {isLoading ? Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="w-full flex border-2 rounded-md mx-auto p-4 animate-in fade-in-20">
                            <div className="flex animate-pulse flex-row items-center h-full justify-center space-x-5">
                                <div className="flex flex-col gap-2">
                                    <div className="w-12 bg-gray-300 h-12 rounded-full"></div>
                                    <span className="w-12 bg-gray-300 h-3 rounded-md"></span>
                                </div>
                                <div className="flex flex-col space-y-3">
                                    <div className="w-36 bg-gray-300 h-6 rounded-md">
                                    </div>
                                    <div className="w-24 bg-gray-300 h-6 rounded-md">
                                    </div>
                                </div>
                            </div>
                        </div>
                    )) : null}

                    {!isLoading && data && data?.result.length ? data.result.map((value) => (
                        <div key={value.id} className="w-full flex flex-col sm:flex-row border-2 rounded-md mx-auto p-4 items-center justify-between animate-in fade-in-20">
                            <div className="flex flex-row items-center h-full justify-center space-x-5">
                                <div className="flex flex-col gap-1 items-center">
                                    <img className="h-12 w-12 rounded-full" src={"https://lh3.googleusercontent.com/a/AGNmyxYcKL2ewkT9EnBkCBn0gB3q_VpvBia2Los5HwXyVQ=s96-c"} alt="avatar" />
                                    <span className="h-3 rounded-md text-sm">{value.owner.name}</span>
                                </div>
                                <div className="flex flex-col space-y-3">
                                    <Link href={{ pathname: "/threads/[thread]/post/[id]", query: { thread: thread.id, id: value.id } }} className="h-6 rounded-md font-bold text-2xl underline">
                                        {value.name}
                                    </Link>
                                    <div className="h-6 rounded-md text-sm text-gray-600">
                                        {new Date(value.created).toLocaleDateString("en-us", { weekday: "long", year: "numeric", month: "long", day: "numeric", })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )) : null}

                    {!isLoading && data && !data.result.length ? (
                        <div className="w-full flex flex-col sm:flex-row border-2 rounded-md mx-auto p-4 items-center justify-center animate-in fade-in-20">
                            <div className="flex flex-row items-center h-full justify-center space-x-5">
                                <h1 className="font-bold">No Posts where found!</h1>
                            </div>
                        </div>
                    ) : null}


                    <div className='flex items-center justify-evenly mt-auto mb-10'>
                        <button onClick={() => setPage(data?.previousPage ?? 1)} disabled={isLoading || data?.isFirstPage} type="button" className="disabled:pointer-events-none disabled:opacity-70 inline-block rounded bg-primary px-6 pt-2.5 pb-2 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)]">
                            Prev
                        </button>

                        <div>{data?.currentPage ?? 0} of {data?.currentPage ?? 0}</div>

                        <button onClick={() => setPage(data?.nextPage ?? 1)} disabled={isLoading || data?.isLastPage} type="button" className="disabled:pointer-events-none disabled:opacity-70 inline-block rounded bg-primary px-6 pt-2.5 pb-2 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)]">
                            Next
                        </button>
                    </div>
                </div>
            </main>
            <Footer />
            {preview ? <ExitPreview /> : null}
        </div>
    );
}

export default Thread;