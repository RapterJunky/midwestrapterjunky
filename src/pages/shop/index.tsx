import type { SeoOrFaviconTag } from "react-datocms/seo";
import type { GetStaticPropsResult } from "next";
import { useRouter } from "next/router";
import Link from "next/link";
import useSWR from "swr";

import ShopNavbar from "@components/shop/ShopNavbar";
import ShopOption from "@components/shop/ShopOption";
import Skeleton from "@components/shop/Skeleton";
import ShopCard from "@components/shop/ShopCard";
import Footer from "@components/layout/Footer";
import Navbar from "@components/layout/Navbar";
import SiteTags from "@components/SiteTags";

import type { FullPageProps, NextPageWithProvider } from "@type/page";
import genericSeoTags from "@lib/utils/genericSeoTags";
import GenericPageQuery from "@/gql/queries/generic";
import useSearchMeta from "@hook/useSearchMeta";
import { fetchCachedQuery } from "@lib/cache";
import { CartProvider } from "@hook/useCart";
import useCatalog from "@hook/useCatalog";

type Props = FullPageProps & { seo: SeoOrFaviconTag[] };

export const getStaticProps = async (): Promise<
  GetStaticPropsResult<Props>
> => {
  const props = await fetchCachedQuery<FullPageProps>(
    "GenericPage",
    GenericPageQuery
  );

  return {
    props: {
      ...props,
      seo: genericSeoTags({
        title: "Shop",
        description: "Midwest Ratpor Junkies shop.",
        url: "https://midwestraptorjunkies.com/shop",
      }),
    },
  };
};

const filterQuery = (query: Record<string, string | string[] | undefined>) =>
  Object.keys(query).reduce<Record<string, string>>((obj, key) => {
    const value = query[key];
    if (!value) return obj;
    if (Array.isArray(value)) {
      const param = value.at(0);
      if (!param) return obj;
      obj[key] = param;
      return obj;
    }
    obj[key] = value;
    return obj;
  }, {});

const ShopSearch: NextPageWithProvider<Props> = ({ _site, navbar, seo }) => {
  const router = useRouter();
  const meta = useSearchMeta();
  const {
    data: categories,
    error: categoriesError,
    isLoading: categoriesIsLoading,
  } = useSWR<Array<{ name: string; id: string }>, Response, [string]>(
    ["/api/shop/categories"],
    ([url]) =>
      fetch(url).then((r) => r.json()) as Promise<
        Array<{ name: string; id: string }>
      >
  );
  const { data, error, isLoading } = useCatalog(meta);

  return (
    <div className="flex h-full flex-col">
      <SiteTags tags={[_site.faviconMetaTags, seo]} />
      <Navbar mode="none" {...navbar} />
      <ShopNavbar />
      <main className="flex w-full flex-grow flex-col items-center px-4">
        <div className="mx-auto mb-10 mt-3 grid w-full max-w-7xl flex-1 grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="order-1 col-span-8 lg:order-none lg:col-span-2">
            {!categories || categoriesError || categoriesIsLoading ? null : (
              <ShopOption
                name="All Categories"
                selectedName="Category"
                option="category"
                data={categories.map((item) => ({
                  name: item.name,
                  id: item.id,
                  link: `/shop?category=${item.id}`,
                }))}
              />
            )}
            <ShopOption
              name="All Vendors"
              selectedName="Vendor"
              data={[
                {
                  name: "Midwest",
                  id: "midwest",
                  link: "/shop?vendor=midwest",
                },
              ]}
              option="vendor"
            />
          </div>

          <div className="order-3 col-span-8 lg:order-none">
            {!data && !isLoading && error ? (
              <div className="mb-12 transition duration-75 ease-in">
                <span className="animate-in fade-in">
                  There was an issue when loading the products.
                </span>
              </div>
            ) : null}
            {data && !error && !isLoading && !data.result.length ? (
              <div className="mb-12 transition duration-75 ease-in">
                <span className="animate-in fade-in">
                  {router.query?.query ? (
                    <>
                      There are no products that match &quot;
                      <strong>{router.query.query}</strong>&quot;
                    </>
                  ) : (
                    "There are no products to display."
                  )}
                </span>
              </div>
            ) : null}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data && !error && !isLoading
                ? data.result.map((item, i) => <ShopCard key={i} {...item} />)
                : Array.from({ length: 15 }).map((_, i) => (
                    <Skeleton key={i} />
                  ))}
            </div>
            <div className="mt-10 flex w-full justify-center">
              <ul className="list-style-none flex space-x-4">
                <li>
                  <Link
                    onClick={() => router.back()}
                    aria-disabled={
                      router.query.last === "true" ? "true" : "false"
                    }
                    data-headlessui-state={
                      router.query.last === "true" ? "active" : "disabled"
                    }
                    className="inline-block rounded-sm bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 ui-active:bg-primary-700 ui-active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] ui-disabled:pointer-events-none ui-disabled:opacity-70"
                    href="/shop"
                  >
                    Previous
                  </Link>
                </li>
                <li>
                  <Link
                    data-headlessui-state={
                      data?.hasNextPage ? "active" : "disabled"
                    }
                    aria-disabled={data?.hasNextPage ? "true" : "false"}
                    href={{
                      pathname: "/shop",
                      query: {
                        cursor: data?.hasNextPage
                          ? data?.nextCursor
                          : router.query.cursor,
                        last: true,
                      },
                    }}
                    className="inline-block rounded-sm bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 ui-active:bg-primary-700 ui-active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] ui-disabled:pointer-events-none ui-disabled:opacity-70"
                  >
                    Next
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="order-2 col-span-8 lg:order-none lg:col-span-2">
            <ShopOption
              name="Relevance"
              selectedName="Relevance"
              option="sort"
              data={[
                {
                  name: "Latest arrivals",
                  id: "latest",
                  link: {
                    pathname: "/shop",
                    query: filterQuery({
                      query: router.query?.query,
                      sort: "latest",
                    }),
                  },
                },
                {
                  name: "Price: Low to high",
                  id: "lth",
                  link: {
                    pathname: "/shop",
                    query: filterQuery({
                      query: router.query?.query,
                      sort: "lth",
                    }),
                  },
                },
                {
                  name: "Price: High to low",
                  id: "htl",
                  link: {
                    pathname: "/shop",
                    query: filterQuery({
                      query: router.query?.query,
                      sort: "htl",
                    }),
                  },
                },
              ]}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

ShopSearch.provider = CartProvider;

export default ShopSearch;
