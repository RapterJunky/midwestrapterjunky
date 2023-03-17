import type { GetStaticPropsResult, NextPage } from "next";
import type { SeoOrFaviconTag } from "react-datocms";
import Link from "next/link";
import { HiArrowLeft } from "react-icons/hi";

import SiteTags from "@components/SiteTags";

import { DatoCMS } from "@api/gql";
import Query from "@query/queries/generic";
import { fetchCacheData } from "@lib/cache";

type Props = {
  _site: {
    faviconMetaTags: SeoOrFaviconTag[];
  };
};

export const getStaticProps = async (): Promise<GetStaticPropsResult<Props>> => {
  const data = await fetchCacheData<Props>("GenericPage", () => DatoCMS<Props>(Query));
  return {
    props: data,
  };
};

/**
 * @author Vojislav
 * @see https://tailwindcomponents.com/u/vojislav
 */
const ErrorPage: NextPage<Props> = (props) => {
  return (
    <div className="flex h-screen w-full flex-grow items-center justify-center bg-gray-200 px-16 md:px-0">
      <SiteTags
        tags={[
          props._site.faviconMetaTags,
          [
            { tag: "title", content: "Server Error - Midwest Raptor Junkies" },
            {
              tag: "meta",
              attributes: { name: "robots", content: "noindex,nofollow" },
            },
          ],
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
          <HiArrowLeft className="h-5 w-5" />
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
}

export default ErrorPage;