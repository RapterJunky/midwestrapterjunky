import type { Metadata, ResolvingMetadata } from "next";
import { ArrowLeft } from "lucide-react";
import { Suspense } from "react";
import Link from "next/link";

import ErrorMessage from "@/components/pages/auth/error/ErrorMessage";
import getGenericSeoTags from "@lib/helpers/getGenericSeoTags";

export async function generateMetadata(
  {},
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const icons = (await parent).icons;

  return getGenericSeoTags({
    icons,
    description: "Midwest Raptor Junkies auth error page",
    title: "Error",
    robots: false,
    url: "https://midwestraptorjunkies.com/auth/error",
  });
}

const AuthError: React.FC = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-200 px-16 md:px-0">
      <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-8 shadow-2xl md:px-8 lg:px-24">
        <p className="text-6xl font-bold tracking-wider text-gray-300 md:text-7xl lg:text-9xl">
          Error
        </p>
        <Suspense fallback={<span>Loading...</span>}>
          <ErrorMessage />
        </Suspense>
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

export default AuthError;
