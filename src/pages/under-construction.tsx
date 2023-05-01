import type { GetStaticPropsResult, NextPage } from "next";
import type { SeoOrFaviconTag } from "react-datocms/seo";
import Link from "next/link";

import FontAwesomeIcon from "@/components/ui/FontAwesomeIcon";
import SiteTags from "@components/SiteTags";

import genericSeoTags from "@lib/utils/genericSeoTags";
import type { FullPageProps } from "@type/page";
import { fetchCachedQuery } from "@lib/cache";
import Query from "@query/queries/generic";

type Props = Pick<FullPageProps, "_site"> & { seo: SeoOrFaviconTag[] };

export const getStaticProps = async (): Promise<
  GetStaticPropsResult<Props>
> => {
  const data = await fetchCachedQuery<Props>("GenericPage", Query, {
    ci: process.env.CI,
  });
  return {
    props: {
      _site: data._site,
      seo: genericSeoTags({
        title: "Under Construstion",
        description:
          "This page on Midest Raptor Junkies is under construstion.",
        robots: false,
      }),
    },
  };
};

const UnderConstructionPage: NextPage<Props> = ({ _site, seo }) => {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-200 px-16 md:px-0">
      <SiteTags tags={[_site.faviconMetaTags, seo]} />
      <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-8 shadow-2xl md:px-8 lg:px-24">
        <p className="text-6xl font-bold tracking-wider text-gray-300 md:text-7xl lg:text-9xl">
          503
        </p>
        <p className="mt-4 text-2xl font-bold tracking-wider text-gray-500 md:text-3xl lg:text-5xl">
          Under Construction
        </p>
        <p className="mt-4 border-b-2 pb-4 text-center text-gray-500">
          Sorry, this page is under construction, comeback later when its ready!
        </p>
        <Link
          href="/"
          className="mt-6 flex items-center space-x-2 rounded bg-blue-600 px-4 py-2 text-gray-100 transition duration-150 hover:bg-blue-700"
          title="Return Home"
        >
          <FontAwesomeIcon
            className="h-5 w-5"
            prefix="hi"
            iconName="arrowleft"
            fillRule="evenodd"
            clipRule="evenodd"
            icon={[
              20,
              20,
              [],
              "",
              "M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z",
            ]}
          />
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
};
// <HiArrowLeft className="h-5 w-5" />
export default UnderConstructionPage;
