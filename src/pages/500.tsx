import type { GetStaticPropsResult, NextPage } from "next";
import type { SeoOrFaviconTag } from "react-datocms/seo";
import Link from "next/link";

import FontAwesomeIcon from "@components/FontAwesomeIcon";
import SiteTags from "@components/SiteTags";

import genericSeoTags from "@lib/utils/genericSeoTags";
import type { FullPageProps } from "@type/page";
import { fetchCachedQuery } from "@lib/cache";
import Query from "@query/queries/generic";

type Props = Pick<FullPageProps, "_site"> & { seo: SeoOrFaviconTag[] };

export const getStaticProps = async (): Promise<
  GetStaticPropsResult<Props>
> => {
  const data = await fetchCachedQuery<Props>("GenericPage", Query);
  return {
    props: {
      _site: data._site,
      seo: genericSeoTags({
        title: "Server Error",
        description: "Midwest Raptor Junkies has experienced an interal server error.",
        robots: false
      })
    },
  };
};

/**
 * @author Vojislav
 * @see https://tailwindcomponents.com/u/vojislav
 */
const ErrorPage: NextPage<Props> = ({ _site, seo }) => {
  return (
    <div className="flex h-screen w-full flex-grow items-center justify-center bg-gray-200 px-16 md:px-0">
      <SiteTags
        tags={[
          _site.faviconMetaTags,
          seo
        ]}
      />
      <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-8 shadow-2xl md:px-8 lg:px-24">
        <p className="text-6xl font-bold tracking-wider text-gray-300 md:text-7xl lg:text-9xl">
          500
        </p>
        <p className="mt-4 text-2xl font-bold tracking-wider text-gray-500 md:text-3xl lg:text-5xl">
          Server Error
        </p>
        <p className="mt-8 border-y-2 py-2 text-center text-gray-500">
          Whoops, something went wrong on our end.
        </p>
        <Link
          href="/"
          className="mt-6 flex items-center space-x-2 rounded bg-blue-600 px-4 py-2 text-gray-100 transition duration-150 hover:bg-blue-700"
          title="Return Home"
        >
          <FontAwesomeIcon className="h-5 w-5" prefix="hi" iconName="arrowleft" fillRule="evenodd" clipRule="evenodd" icon={[20, 20, [], "", "M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"]} />
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
};
// <HiArrowLeft className="h-5 w-5" />

export default ErrorPage;
