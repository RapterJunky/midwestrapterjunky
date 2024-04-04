import type { Metadata } from "next";
import PHProvider from "@/components/analytics/PostHog";
import getSeoTags from "@/lib/helpers/getSeoTags";
import getFullPageProps from "@/lib/services/getFullPageProps";
import GoogleAnalytics from "@components/analytics/GoogleAnalytics";

export async function generateMetadata(): Promise<Metadata> {
  const data = await getFullPageProps();

  return getSeoTags({ datocms: data.site.faviconMetaTags });
}

const AnalyticsLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <>
      {process.env.NEXT_PUBLIC_VERCEL_ENV === "production" ? (
        <PHProvider>{children}</PHProvider>
      ) : (
        children
      )}
      <GoogleAnalytics debug={process.env.VERCEL_ENV !== "production"} />
    </>
  );
};

export default AnalyticsLayout;
