import Script from "next/script";
import Head from "next/head";

const GoogleAnalytics: React.FC<{ debug: boolean }> = ({ debug }) => {
  return (
    <>
      <Head>
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        <link rel="preconnect" href="//www.googletagmanager.com" />
      </Head>
      <Script
        id="google-analytics-js"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
      >
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag("js",new Date());
          gtag("config","${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}",{
              page_path: window.location.pathname,
              ${debug ? `debug_mode: ${debug}` : ""}
          });`}
      </Script>
    </>
  );
};

export default GoogleAnalytics;
