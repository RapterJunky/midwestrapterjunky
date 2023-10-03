import { toNextMetadata } from "react-datocms/seo";
import type { Metadata } from "next";

import GoogleAnalytics from "@components/analytics/GoogleAnalytics";
import getFullPageProps from "@/lib/services/getFullPageProps";
import NewRelic from "@/components/analytics/NewRelic";

export async function generateMetadata(): Promise<Metadata> {
  const data = await getFullPageProps();

  return toNextMetadata(data.site.faviconMetaTags);
}

const AnalyticsLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <>
      {children}
      <GoogleAnalytics debug={process.env.VERCEL_ENV !== "production"} />
      {process.env.VERCEL_ENV === "production" ? <NewRelic /> : null}
    </>
  );
};

export default AnalyticsLayout;
