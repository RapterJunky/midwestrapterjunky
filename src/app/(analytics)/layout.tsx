import type { Metadata } from "next";

import GoogleAnalytics from "@components/analytics/GoogleAnalytics";
import getFullPageProps from "@/lib/services/getFullPageProps";
import NewRelic from "@/components/analytics/NewRelic";
import getSeoTags from "@/lib/helpers/getSeoTags";

export async function generateMetadata(): Promise<Metadata> {
  const data = await getFullPageProps();

  return getSeoTags({ datocms: data.site.faviconMetaTags });
}

const AnalyticsLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <>
      {children}
      <GoogleAnalytics debug={process.env.VERCEL_ENV !== "production"} />
      {process.env.VERCEL_ENV !== "development" ? <NewRelic /> : null}
    </>
  );
};

export default AnalyticsLayout;
