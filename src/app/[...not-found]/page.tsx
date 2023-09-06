import { ArrowLeft } from 'lucide-react';
import type { Metadata } from "next";
import Link from "next/link";

import getGenericSeoTags from "@lib/helpers/getGenericSeoTags";
import getFullPageProps from "@lib/services/getFullPageProps";
import { Button } from "@/components/ui/button";

export async function generateMetadata(): Promise<Metadata> {
  const data = await getFullPageProps();

  return getGenericSeoTags({
    icons: data.site.faviconMetaTags,
    robots: false,
    description:
      "Midwest Raptor Junkies failed to find what you where looking for.",
    title: "Not Found",
  });
}

/**
 * @link https://github.com/vercel/next.js/issues/45620
 * @author Vojislav
 * @see https://tailwindcomponents.com/u/vojislav
 */
const NotFoundCatchAll = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-200 px-16 md:px-0">
      <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-8 shadow-2xl md:px-8 lg:px-24">
        <p className="text-6xl font-bold tracking-wider text-gray-300 md:text-7xl lg:text-9xl">
          404
        </p>
        <p className="mt-4 text-2xl font-bold tracking-wider text-gray-500 md:text-3xl lg:text-5xl">
          Page Not Found
        </p>
        <p className="my-4 border-b-2 pb-4 text-center text-gray-500">
          Sorry, the page you are looking for could not be found.
        </p>
        <Button asChild>
          <Link
            href="/"
            title="Return Home"
          >
            <ArrowLeft className="mr-1" />
            Return Home
          </Link>
        </Button>

      </div>
    </div>
  );
};

export default NotFoundCatchAll;
