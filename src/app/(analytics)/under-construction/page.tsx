import type { Metadata, ResolvingMetadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import getSeoTags from "@/lib/helpers/getSeoTags";

export async function generateMetadata(
  { },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  return getSeoTags({
    parent,
    seo: {
      robots: false,
      slug: "/not-found",
      description: "Midwest Raptor Junkies failed to find what you where looking for.",
      title: "Not Found",
    }
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
          <ArrowLeft className="h-5 w-5" />
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
};

export default Page;
