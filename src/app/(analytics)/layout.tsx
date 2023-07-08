import GoogleAnalytics from "@components/pages/GoogleAnalytics";

const AnalyticsLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <>
      {children}
      <GoogleAnalytics debug={process.env.VERCEL_ENV !== "production"} />
    </>
  );
};

export default AnalyticsLayout;
