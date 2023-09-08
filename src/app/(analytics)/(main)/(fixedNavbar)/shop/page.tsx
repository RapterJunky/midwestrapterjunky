import type { Metadata, ResolvingMetadata } from "next";
import { Suspense } from "react";

import SearchSettingsList from "@/components/pages/shop/searchOptions/SearchSettingsList";
import FallBackOptions from "@/components/pages/shop/searchOptions/OptionsFallback";
import Categories from "@/components/pages/shop/searchOptions/Categories";
import CatalogFallback from "@/components/pages/shop/CatalogFallback";
import Vendors from "@/components/pages/shop/searchOptions/Vendors";
import Catalog from "@/components/pages/shop/Catalog";
import getSeoTags from "@/lib/helpers/getSeoTags";

type PageParams = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  return getSeoTags({
    parent,
    seo: {
      title: "Shop",
      robots: true,
      description: "Midwest Raptor Junkies shop home page",
      slug: `/shop`,
    }
  });
}

const ShopHome: React.FC<PageParams> = ({ searchParams }) => {
  const search = new URLSearchParams(
    Object.entries(searchParams).reduce(
      (prev, [key, value]) => {
        if (!value) return prev;
        /** Not going to support search arrays now as its not required with the given params */
        if (Array.isArray(value)) return prev;
        prev[key] = value;

        return prev;
      },
      {} as Record<string, string>,
    ),
  );

  return (
    <div className="flex w-full flex-grow flex-col items-center px-4">
      <div className="mx-auto mb-10 mt-3 grid w-full max-w-7xl flex-1 grid-cols-1 lg:grid-cols-12 lg:gap-4">
        <div className="order-1 col-span-8 lg:order-none lg:col-span-2">
          <Suspense fallback={<FallBackOptions />}>
            <Categories />
          </Suspense>
          <Suspense fallback={<FallBackOptions />}>
            <Vendors />
          </Suspense>
        </div>
        <div className="order-3 col-span-8 lg:order-none">
          <Suspense fallback={<CatalogFallback />}>
            <Catalog query={search} />
          </Suspense>
        </div>
        <div className="order-2 col-span-8 mb-2 lg:order-none lg:col-span-2 lg:mb-0">
          <SearchSettingsList
            queryKey="sort"
            items={[
              {
                name: "Latest arrivals",
                value: "latest",
              },
              {
                name: "Price: Low to high",
                value: "lth",
              },
              {
                name: "Price: High to low",
                value: "htl",
              },
            ]}
            name="Relevance"
          />
        </div>
      </div>
    </div>
  );
};

export default ShopHome;
