import type { GetStaticPropsResult, GetStaticPropsContext, NextPage } from 'next';
import Link from 'next/link';
import type { FullPageProps } from '@type/page';

import SiteTags from '@components/SiteTags';
import Navbar from '@components/layout/Navbar';
import Footer from '@components/layout/Footer';
import ExitPreview from '@components/ExitPreview';

import { DatoCMS } from '@api/gql';
import prisma, { type Thread } from '@api/prisma';

import GenericPageQuery from '@query/queries/generic';


interface Props extends FullPageProps {
    threads: Thread[]
}

export const getStaticProps = async (ctx: GetStaticPropsContext): Promise<GetStaticPropsResult<Props>> => {

    const [props, threads] = await Promise.all([
        DatoCMS<Props>(GenericPageQuery, {
            preview: ctx.preview,
        }),
        prisma.thread.findMany()
    ]);

    return {
        props: {
            ...props,
            threads,
            preview: ctx?.preview ?? false
        }
    }
}

const Threads: NextPage<Props> = ({ threads, preview, _site, navbar }) => {
    return (
        <div className="flex flex-col h-full">
            <SiteTags tags={[_site.faviconMetaTags, [{ tag: "title", content: "Threads - Midest Raptor Junkies" }]]} />
            <header>
                <Navbar {...navbar} mode="none" />
            </header>
            <main className="flex-1 flex flex-col items-center">
                <div className="container my-6">
                    <h1 className="font-bold text-2xl">Threads</h1>
                </div>
                <div className="container flex flex-col gap-4 mt-4">
                    {threads.map(value => (
                        <Link key={value.id} className="shadow-lg h-max p-2 rounded-sm flex justify-between" href={{ pathname: "/threads/[thread]", query: { thread: value.id } }}>
                            <div>
                                <h1 className="underline font-bold text-gray-800">{value.name}</h1>
                                <span className="text-xs text-gray-500">Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequuntur, sit quo?</span>
                            </div>
                            <button className='inline-block rounded bg-indigo-600 px-8 py-3 text-sm font-medium text-white transition hover:scale-110 hover:shadow-xl focus:outline-none focus:ring active:bg-indigo-500'>View</button>
                        </Link>
                    ))}
                </div>
            </main>
            <Footer />
            {preview ? <ExitPreview /> : null}
        </div>
    );
}

export default Threads;