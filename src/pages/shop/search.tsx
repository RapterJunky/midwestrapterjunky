import type { GetStaticPropsContext, GetStaticPropsResult } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import useSWR from 'swr';

import ShopNavbar from '@/components/shop/ShopNavbar';
import ShopOption from '@/components/shop/ShopOption';
import Skeleton from '@/components/shop/Skeleton';
import ShopCard from '@/components/shop/ShopCard';
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import SiteTags from '@/components/SiteTags';

import GenericPageQuery from '@/gql/queries/generic';
import type { FullPageProps } from '@/types/page';
import useSearchMeta from '@/hooks/useSearchMeta';
import { fetchCachedQuery } from '@/lib/cache';
import useCatalog from '@/hooks/useCatalog';

interface Props extends FullPageProps { }

export const getStaticProps = async (
    ctx: GetStaticPropsContext
): Promise<GetStaticPropsResult<Props>> => {
    const props = await fetchCachedQuery<Props>("GenericPage", GenericPageQuery);

    return {
        props,
    };
}

const filterQuery = (query: any) =>
    Object.keys(query).reduce<any>((obj, key) => {
        if (query[key]?.length) {
            obj[key] = query[key];
        }
        return obj;
    }, {} as Record<string, string>);

const ShopSearch: React.FC<Props> = ({ _site, navbar }) => {
    const router = useRouter();
    const meta = useSearchMeta();
    const { data: categories, error: categoriesError, isLoading: categoriesIsLoading } = useSWR(["/api/shop/categories"], ([url]) => fetch(url).then(r => r.json()) as Promise<Array<{ name: string; id: string; }>>);
    const { data, error, isLoading } = useCatalog(meta);

    return (
        <div className="flex flex-col h-full">
            <SiteTags tags={[_site.faviconMetaTags, [{ tag: "title", content: "Shop - Midwest Raptor Junkies" }]]} />
            <Navbar mode="none" {...navbar} />
            <ShopNavbar />
            <main className="flex-grow flex flex-col items-center w-full px-4">
                <div className='w-full mx-auto grid grid-cols-1 lg:grid-cols-12 max-w-7xl gap-4 mt-3 mb-10 flex-1'>
                    <div className="col-span-8 lg:col-span-2 order-1 lg:order-none">
                        {!categories || categoriesError || categoriesIsLoading ? (null) : (
                            <ShopOption name="All Categories" selectedName='Category' option="category" data={
                                categories.map((item) => ({ name: item.name, id: item.id, link: `/shop/search?category=${item.id}` }))
                            } />
                        )}
                        <ShopOption name="All Vendors" selectedName='Vendor' data={[
                            { name: "Midwest", id: "midwest", link: "/shop/search?vendor=midwest" }
                        ]} option="vendor" />
                    </div>

                    <div className="col-span-8 order-3 lg:order-none">
                        {!data && !isLoading && error ? (
                            <div className="mb-12 transition ease-in duration-75">
                                <span className="animate-in fade-in">There was an issue when loading the products.</span>
                            </div>
                        ) : null}
                        {data && !error && !isLoading && !data.result.length ? (
                            <div className="mb-12 transition ease-in duration-75">
                                <span className="animate-in fade-in">
                                    {router.query?.query ? (
                                        <>There are no products that match "<strong>{router.query.query}</strong>"</>
                                    ) : ("There are no products to display.")
                                    }
                                </span>
                            </div>
                        ) : null}
                        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                            {data && !error && !isLoading ? (
                                data.result.map((item: any, i: number) => (
                                    <ShopCard key={i} {...item} />
                                ))
                            ) : Array.from({ length: 15 }).map((_, i) => (
                                <Skeleton key={i} />
                            ))}
                        </div>
                        <div className="w-full flex justify-center mt-10">
                            <ul className="list-style-none flex space-x-4">
                                <li>
                                    <Link onClick={() => router.back()} aria-disabled={router.query.last === "true" ? "true" : "false"} data-headlessui-state={router.query.last === "true" ? "active" : "disabled"} className="inline-block rounded bg-primary px-6 pt-2.5 pb-2 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 ui-active:bg-primary-700 ui-active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] ui-disabled:pointer-events-none ui-disabled:opacity-70" href="/shop/search">Previous</Link>
                                </li>
                                <li>
                                    <Link data-headlessui-state={data?.hasNextPage ? "active" : "disabled"} aria-disabled={data?.hasNextPage ? "true" : "false"} href={{
                                        pathname: "/shop/search",
                                        query: {
                                            cursor: data?.hasNextPage ? data?.nextCursor : router.query.cursor,
                                            last: true
                                        }
                                    }} className="inline-block rounded bg-primary px-6 pt-2.5 pb-2 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 ui-active:bg-primary-700 ui-active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] ui-disabled:pointer-events-none ui-disabled:opacity-70" >Next</Link>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="col-span-8 lg:col-span-2 order-2 lg:order-none">
                        <ShopOption name="Relevance" selectedName="Relevance" option="sort" data={[
                            { name: "Latest arrivals", id: "latest", link: { pathname: "/shop/search", query: filterQuery({ query: router.query?.query, sort: "latest" }) } },
                            { name: "Price: Low to high", id: "lth", link: { pathname: "/shop/search", query: filterQuery({ query: router.query?.query, sort: "lth" }) } },
                            { name: "Price: High to low", id: "htl", link: { pathname: "/shop/search", query: filterQuery({ query: router.query?.query, sort: "htl" }) } },
                        ]} />
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default ShopSearch;