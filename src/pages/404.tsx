import type { GetStaticPropsResult, NextPage } from "next";
import Link from "next/link";
import { HiArrowLeft } from "react-icons/hi";
import SiteTags from "@components/SiteTags";

import Query from "@query/queries/generic";
import { fetchCachedQuery } from "@lib/cache";
import type { FullPageProps } from "@type/page";

type Props = Pick<FullPageProps, "_site">;

export const getStaticProps = async (): Promise<
  GetStaticPropsResult<Props>
> => {
  const data = await fetchCachedQuery<Props>("GenericPage", Query, {
    ci: process.env.CI === "true",
  });
  return {
    props: {
      _site: data._site,
    },
  };
};

/**
 * @author Vojislav
 * @see https://tailwindcomponents.com/u/vojislav
 */
const ErrorPage: NextPage<Props> = ({ _site }) => {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-200 px-16 md:px-0">
      <SiteTags
        tags={[
          _site.faviconMetaTags,
          [
            { tag: "title", content: "Not Found - Midwest Raptor Junkies" },
            {
              tag: "meta",
              attributes: { name: "robots", content: "noindex,nofollow" },
            },
          ],
        ]}
      />
      <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-8 shadow-2xl md:px-8 lg:px-24">
        <p className="text-6xl font-bold tracking-wider text-gray-300 md:text-7xl lg:text-9xl">
          404
        </p>
        <p className="mt-4 text-2xl font-bold tracking-wider text-gray-500 md:text-3xl lg:text-5xl">
          Page Not Found
        </p>
        <p className="mt-4 border-b-2 pb-4 text-center text-gray-500">
          Sorry, the page you are looking for could not be found.
        </p>
        <Link
          href="/"
          className="mt-6 flex items-center space-x-2 rounded bg-blue-600 px-4 py-2 text-gray-100 transition duration-150 hover:bg-blue-700"
          title="Return Home"
        >
          <HiArrowLeft className="h-5 w-5" />
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
};

export default ErrorPage;
