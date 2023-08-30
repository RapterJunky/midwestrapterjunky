import Script from "next/script";

const GoogleAnalytics: React.FC<{ debug: boolean }> = ({ debug }) => {
  return (
    <>
      <Script
        id="google-analytics-js"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag("js",new Date());
                gtag("config","${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}",{
                    page_path: window.location.pathname,
                    transport_url: "https://www.google-analytics.com",
                    first_party_collection: true,
                    ${debug ? `debug_mode: ${debug}` : ""}
                });`,
        }}
      ></Script>
    </>
  );
};

export default GoogleAnalytics;
