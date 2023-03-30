import type { GetStaticPropsContext, GetStaticPropsResult } from 'next';
import { HiPlus, HiPlusCircle, HiSearch } from 'react-icons/hi';
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import GenericPageQuery from '@/gql/queries/generic';

import { fetchCachedQuery } from '@/lib/cache';
import type { FullPageProps } from '@/types/page';
import SiteTags from '@/components/SiteTags';
import Link from 'next/link';
import Image from 'next/image';
import ShopCard from '@/components/shop/ShopCard';




interface Props extends FullPageProps { }

export const getStaticProps = async (
    ctx: GetStaticPropsContext
): Promise<GetStaticPropsResult<Props>> => {
    const props = await fetchCachedQuery<Props>("GenericPage", GenericPageQuery);

    return {
        props,
    };
}

const ShopSearch: React.FC<Props> = ({ _site, navbar }) => {
    return (
        <div className="flex flex-col h-full">
            <SiteTags tags={[_site.faviconMetaTags]} />
            <Navbar mode="none" {...navbar} />
            <div className='flex justify-center rounded-sm mb-4 w-full'>
                <form className="border border-gray-500 flex items-center w-1/4">
                    <input placeholder='Search' type="text" className="border-none focus:outline-none w-full" />
                    <HiSearch className="h-5 w-5 mx-2" />
                </form>
            </div>
            <main className="flex-grow flex flex-col items-center w-full px-4">
                <div className='w-full mx-auto grid grid-cols-1 lg:grid-cols-12 max-w-7xl gap-4 mt-3 mb-10 flex-1'>
                    <div className="col-span-8 lg:col-span-2 order-1 lg:order-none">
                        <div className="relative inline-block w-full">
                            <div className="lg:hidden">
                                <span className="rounded-md shadow-sm">
                                    <button type="button" className="flex justify-between w-full rounded-sm border border-accent-3 px-4 py-3 bg-accent-0 text-sm leading-5 font-medium text-accent-4 hover:text-accent-5 focus:outline-none focus:border-blue-300 focus:shadow-outline-normal active:bg-accent-1 active:text-accent-8 transition ease-in-out duration-150" id="options-menu" aria-haspopup="true" aria-expanded="true">All Categories
                                        <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd">
                                            </path>
                                        </svg>
                                    </button>
                                </span>
                            </div>
                            <div className="origin-top-left absolute lg:relative left-0 mt-2 w-full rounded-md shadow-lg lg:shadow-none z-10 mb-10 lg:block hidden">
                                <div className="rounded-sm bg-accent-0 shadow-xs lg:bg-none lg:shadow-none">
                                    <div role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                        <ul>
                                            <li className="block text-sm leading-5 text-zinc-600 lg:text-base lg:no-underline lg:font-bold lg:tracking-wide hover:bg-accent-1 lg:hover:bg-transparent hover:text-zinc-900 focus:outline-none focus:bg-accent-1 focus:text-accent-8 underline">
                                                <Link className="block lg:inline-block px-4 py-2 lg:p-0 lg:my-2 lg:mx-4" href="/shop/search">All Categories</Link>
                                            </li>
                                            <li className="block text-sm leading-5 text-zinc-600 hover:bg-accent-1 lg:hover:bg-transparent hover:text-zinc-900 focus:outline-none focus:bg-accent-1 focus:text-accent-8">
                                                <Link className="block lg:inline-block px-4 py-2 lg:p-0 lg:my-2 lg:mx-4" href="/shop/search?cat=clothes">New Arrivals</Link>
                                            </li>
                                            <li className="block text-sm leading-5 text-zinc-600 hover:bg-accent-1 lg:hover:bg-transparent hover:text-zinc-900 focus:outline-none focus:bg-accent-1 focus:text-accent-8">
                                                <Link className="block lg:inline-block px-4 py-2 lg:p-0 lg:my-2 lg:mx-4" href="/shop/search?cat=featured">Featured</Link>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="relative inline-block w-full">
                            <div className="lg:hidden mt-3">
                                <span className="rounded-md shadow-sm">
                                    <button type="button" className="flex justify-between w-full rounded-sm border border-accent-3 px-4 py-3 bg-accent-0 text-sm leading-5 font-medium text-accent-8 hover:text-accent-5 focus:outline-none focus:border-blue-300 focus:shadow-outline-normal active:bg-accent-1 active:text-accent-8 transition ease-in-out duration-150" id="options-menu" aria-haspopup="true" aria-expanded="true">All Designs
                                        <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                                        </svg>
                                    </button>
                                </span>
                            </div>
                            <div className="origin-top-left absolute lg:relative left-0 mt-2 w-full rounded-md shadow-lg lg:shadow-none z-10 mb-10 lg:block hidden">
                                <div className="rounded-sm bg-accent-0 shadow-xs lg:bg-none lg:shadow-none">
                                    <div role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                        <ul>
                                            <li className="block text-sm leading-5 text-zinc-600 lg:text-base lg:no-underline lg:font-bold lg:tracking-wide hover:bg-accent-1 lg:hover:bg-transparent hover:text-accent-8 focus:outline-none focus:bg-accent-1 focus:text-accent-8 underline">
                                                <Link className="block lg:inline-block px-4 py-2 lg:p-0 lg:my-2 lg:mx-4" href="/shop/search">All Designers</Link>
                                            </li>
                                            <li className="block text-sm leading-5 text-zinc-600 hover:bg-accent-1 lg:hover:bg-transparent hover:text-zinc-900 focus:outline-none focus:bg-accent-1 focus:text-accent-8">
                                                <Link className="block lg:inline-block px-4 py-2 lg:p-0 lg:my-2 lg:mx-4" href="/shop/search?merchant=acme">ACME</Link>
                                            </li>
                                            <li className="block text-sm leading-5 text-zinc-600 hover:bg-accent-1 lg:hover:bg-transparent hover:text-zinc-900 focus:outline-none focus:bg-accent-1 focus:text-accent-8">
                                                <Link className="block lg:inline-block px-4 py-2 lg:p-0 lg:my-2 lg:mx-4" href="/shop/search?merchant=next.js">Next.js</Link>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-8 order-3 lg:order-none">
                        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                            {Array.from({ length: 15 }).map((_, i) => (
                                <ShopCard key={i} />
                            ))}
                        </div>
                        <div className="w-full flex justify-center mt-10">
                            <ul className="list-style-none flex space-x-4">
                                <li>
                                    <Link className="relative block rounded bg-transparent py-1.5 px-3 text-sm text-neutral-600 transition-all duration-300 hover:bg-neutral-100" href="#">Previous</Link>
                                </li>
                                <li>
                                    <Link className="relative block rounded bg-transparent py-1.5 px-3 text-sm text-neutral-600 transition-all duration-300 hover:bg-neutral-100" href="#">1</Link>
                                </li>
                                <li aria-current="page">
                                    <Link className="relative block rounded bg-transparent py-1.5 px-3 text-sm text-neutral-600 transition-all duration-300 hover:bg-neutral-100" href="#">2</Link>
                                </li>
                                <li>
                                    <Link className="relative block rounded bg-transparent py-1.5 px-3 text-sm text-neutral-600 transition-all duration-300 hover:bg-neutral-100" href="#">3</Link>
                                </li>
                                <li>
                                    <Link className="relative block rounded bg-transparent py-1.5 px-3 text-sm text-neutral-600 transition-all duration-300 hover:bg-neutral-100" href="#">Next</Link>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="col-span-8 lg:col-span-2 order-2 lg:order-none">
                        <div className="relative inline-block w-full">
                            <div className="lg:hidden">
                                <span className="rounded-md shadow-sm">
                                    <button type="button" className="flex justify-between w-full rounded-sm border border-accent-3 px-4 py-3 bg-accent-0 text-sm leading-5 font-medium text-accent-4 hover:text-accent-5 focus:outline-none focus:border-blue-300 focus:shadow-outline-normal active:bg-accent-1 active:text-accent-8 transition ease-in-out duration-150" id="options-menu" aria-haspopup="true" aria-expanded="true">Relevance
                                        <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                                        </svg>
                                    </button>
                                </span>
                            </div>
                            <div className="origin-top-left absolute lg:relative left-0 mt-2 w-full rounded-md shadow-lg lg:shadow-none z-10 mb-10 lg:block hidden">
                                <div className="rounded-sm bg-accent-0 shadow-xs lg:bg-none lg:shadow-none">
                                    <div role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                        <ul>
                                            <li className="block text-sm leading-5 text-accent-4 lg:text-base lg:no-underline lg:font-bold lg:tracking-wide hover:bg-accent-1 lg:hover:bg-transparent hover:text-accent-8 focus:outline-none focus:bg-accent-1 focus:text-accent-8 underline">
                                                <Link className="block lg:inline-block px-4 py-2 lg:p-0 lg:my-2 lg:mx-4" href="/search">Relevance</Link>
                                            </li>
                                            <li className="block text-sm leading-5 text-zinc-600 hover:bg-accent-1 lg:hover:bg-transparent hover:text-zinc-900 focus:outline-none focus:bg-accent-1 focus:text-accent-8">
                                                <Link className="block lg:inline-block px-4 py-2 lg:p-0 lg:my-2 lg:mx-4" href="/search?sort=trending-desc">Trending</Link>
                                            </li>
                                            <li className="block text-sm leading-5 text-zinc-600 hover:bg-accent-1 lg:hover:bg-transparent hover:text-zinc-900 focus:outline-none focus:bg-accent-1 focus:text-accent-8">
                                                <Link className="block lg:inline-block px-4 py-2 lg:p-0 lg:my-2 lg:mx-4" href="/search?sort=latest-desc">Latest arrivals</Link>
                                            </li>
                                            <li className="block text-sm leading-5 text-zinc-600 hover:bg-accent-1 lg:hover:bg-transparent hover:text-zinc-900 focus:outline-none focus:bg-accent-1 focus:text-accent-8">
                                                <Link className="block lg:inline-block px-4 py-2 lg:p-0 lg:my-2 lg:mx-4" href="/search?sort=price-asc">Price: Low to high</Link>
                                            </li>
                                            <li className="block text-sm leading-5 text-zinc-600 hover:bg-accent-1 lg:hover:bg-transparent hover:text-zinc-900 focus:outline-none focus:bg-accent-1 focus:text-accent-8">
                                                <Link className="block lg:inline-block px-4 py-2 lg:p-0 lg:my-2 lg:mx-4" href="/search?sort=price-desc">Price: High to low</Link>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default ShopSearch;