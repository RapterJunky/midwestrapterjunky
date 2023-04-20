import type { GetStaticPropsContext, GetStaticPropsResult, NextPage } from "next";
import { useEffect, useState } from 'react';
import { useRouter } from "next/router";
import { Tab } from '@headlessui/react';
import { HiPlus } from 'react-icons/hi';
import { serialize } from 'superjson';
import Link from "next/link";

import CategoryCard from "@components/community/CategoryCard";
import TopicsList from "@components/community/TopicsList";
import ExitPreview from "@components/ExitPreview";
import Footer from "@components/layout/Footer";
import Navbar from "@components/layout/Navbar";
import SiteTags from "@components/SiteTags";

import genericSeoTags from "@lib/utils/genericSeoTags";
import GenericPageQuery from "@query/queries/generic";
import { fetchCachedQuery } from "@lib/cache";
import { FullPageProps } from "@type/page";
import prisma from "@api/prisma";

interface Props extends FullPageProps {
    categories: {
        description: string;
        id: number;
        image: string;
        name: string;
        tags: PrismaJson.Tags | null;
        _count: {
            posts: number;
        };
        posts: {
            name: string;
            id: string;
            pinned: boolean;
            locked: boolean;
            created: Date;
        }[];
    }[]
}

export const getStaticProps = async ({ preview }: GetStaticPropsContext): Promise<GetStaticPropsResult<Props>> => {
    const props = await fetchCachedQuery<FullPageProps>(
        "GenericPage",
        GenericPageQuery
    );

    const cat = await prisma.thread.findMany({
        select: {
            description: true,
            id: true,
            image: true,
            name: true,
            tags: true,
            _count: {
                select: {
                    posts: true
                }
            },
            posts: {
                take: 5,
                orderBy: {
                    pinned: "desc"
                },
                select: {
                    name: true,
                    id: true,
                    pinned: true,
                    locked: true,
                    created: true
                }
            }
        }
    });

    const { json } = serialize(cat);

    return {
        props: {
            ...props,
            categories: json as never as Props["categories"],
            preview: preview ?? false
        }
    };
};

const tab = ["categories", "latest", "top"];

const Community: NextPage<Props> = ({ _site, navbar, preview, categories }) => {
    const [index, setIndex] = useState(0);
    const router = useRouter();

    useEffect(() => {
        if (router.isReady) {
            switch (router.query?.tab) {
                case "latest":
                    setIndex(1);
                    break;
                case "top":
                    setIndex(2);
                    break;
                default:
                    break;
            }
        }
    }, [router.isReady]);

    return (
        <div className="flex flex-col h-full">
            <SiteTags tags={[
                _site.faviconMetaTags,
                genericSeoTags({ title: "Community", description: "Midwest Raptor Junkies Community Hub" })
            ]} />
            <Navbar {...navbar} mode="only-scroll" />
            <main className="flex-1 flex flex-col items-center mt-28">
                <div className="flex flex-col justify-center container max-w-6xl px-2 mb-4">
                    <Tab.Group selectedIndex={index} onChange={(e) => {
                        setIndex(e);
                        router.push({ query: { tab: tab[e] } }, undefined, { shallow: true }).catch(e => console.error(e));
                    }}>
                        <div className="flex flex-col md:flex-row justify-between mb-4">
                            <Tab.List className="flex gap-2 font-bold">
                                <Tab className="ui-selected:border-b-2 border-blue-500 w-full">
                                    <span className="px-2 py-1 hover:text-primary">Categories</span>
                                </Tab>
                                <Tab className="ui-selected:border-b-2 border-blue-500 w-full">
                                    <span className="px-2 py-1 hover:text-primary">Latest</span>
                                </Tab>
                                <Tab className="ui-selected:border-b-2 border-blue-500 w-full">
                                    <span className="px-2 py-1 hover:text-primary">Top</span>
                                </Tab>
                            </Tab.List>
                            <div className="mt-4 md:mt-0">
                                <Link href="/community/create-topic" className="inline-flex w-full md:w-auto justify-center items-center gap-1 rounded-sm bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 ui-active:bg-primary-700 ui-active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] ui-disabled:pointer-events-none ui-disabled:opacity-70">
                                    <HiPlus className="h-4 w-4" />
                                    <span>New Topic</span>
                                </Link>
                            </div>
                        </div>
                        <Tab.Panels>
                            <Tab.Panel>
                                <table className="w-full divide-y-4 mb-8">
                                    <thead>
                                        <tr className="text-neutral-600">
                                            <th className="md:w-[45%] text-left py-3 px-2 font-medium">Category</th>
                                            <th className="w-20 text-right py-3 px-2 hidden md:table-cell font-medium">Topics</th>
                                            <th className="text-left py-3 px-2 hidden md:table-cell font-medium">Latest</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y-2">
                                        {categories.map((category, i) => (
                                            <CategoryCard
                                                key={i}
                                                title={category.name}
                                                desciption={category.description}
                                                image={{ src: category.image, alt: "Category Image" }}
                                                tags={category.tags}
                                                slug={`/community/c/${category.id}`}
                                                topics={category._count.posts}
                                                latestTopics={category.posts}
                                            />
                                        ))}
                                        <tr></tr>
                                    </tbody>
                                </table>
                            </Tab.Panel>
                            <Tab.Panel>
                                <TopicsList mode="latest" />
                            </Tab.Panel>
                            <Tab.Panel>
                                <TopicsList mode="top" />
                            </Tab.Panel>
                        </Tab.Panels>
                    </Tab.Group>
                </div>
            </main>
            {preview ? <ExitPreview /> : null}
            <Footer />
        </div>
    );
}

export default Community;