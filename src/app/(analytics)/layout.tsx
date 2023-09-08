import { toNextMetadata } from "react-datocms/seo";
import type { Metadata } from "next";

import GoogleAnalytics from "@components/pages/GoogleAnalytics";
import getFullPageProps from "@/lib/services/getFullPageProps";

export async function generateMetadata(): Promise<Metadata> {
  const data = await getFullPageProps();

  return toNextMetadata(data.site.faviconMetaTags);
}

const AnalyticsLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <>
      {children}
      <GoogleAnalytics debug={process.env.VERCEL_ENV !== "production"} />
    </>
  );
};

export default AnalyticsLayout;
