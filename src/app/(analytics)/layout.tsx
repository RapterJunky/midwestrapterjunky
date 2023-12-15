import type { Metadata } from "next";

import GoogleAnalytics from "@components/analytics/GoogleAnalytics";
import getFullPageProps from "@/lib/services/getFullPageProps";
import getSeoTags from "@/lib/helpers/getSeoTags";
import PHProvider from "@/components/analytics/PostHog";

export async function generateMetadata(): Promise<Metadata> {
  const data = await getFullPageProps();

  return getSeoTags({ datocms: data.site.faviconMetaTags });
}

const AnalyticsLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <>
      <PHProvider>{children}</PHProvider>
      <GoogleAnalytics debug={process.env.VERCEL_ENV !== "production"} />
    </>
  );
};

export default AnalyticsLayout;
