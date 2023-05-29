import { notFound } from "next/navigation";
import type { Metadata } from "next";

import getGenericSeoTags from "@lib/helpers/getGenericSeoTags";
import getFullPageProps from "@lib/cache/getFullPageProps";

export async function generateMetadata(): Promise<Metadata> {
  const data = await getFullPageProps();

  return getGenericSeoTags({
    icons: data._site.faviconMetaTags,
    robots: false,
    description:
      "Midwest Raptor Junkies failed to find what you where looking for.",
    title: "Not Found",
  });
}

const NotFoundCatchAll = () => {
  notFound();
};

export default NotFoundCatchAll;
