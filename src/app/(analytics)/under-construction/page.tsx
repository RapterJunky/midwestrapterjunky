import { HiArrowLeft } from "react-icons/hi";
import type { Metadata } from "next";
import Link from "next/link";

import getGenericSeoTags from "@lib/helpers/getGenericSeoTags";
import getFullPageProps from "@lib/cache/getFullPageProps";

export async function generateMetadata(): Promise<Metadata> {
  const data = await getFullPageProps();

  return getGenericSeoTags({
    icons: data.site.faviconMetaTags,
    robots: false,
    description: "This page on Midest Raptor Junkies is under construstion.",
    title: "Under Construstion",
  });
}

const Page: React.FC = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-200 px-16 md:px-0">
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
          <HiArrowLeft className="h-5 w-5" />
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
};

export default Page;
