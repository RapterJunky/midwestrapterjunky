import Head from "next/head";
import { SessionProvider } from "next-auth/react";
import { GoogleAnalytics } from "nextjs-google-analytics";
import type { AppProps } from "next/app";

import "@fontsource/inter/variable-full.css";
import "../styles/globals.css";

const DefaultHead: React.FC = () => (
  <Head>
    <meta charSet="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </Head>
);

function App({ Component, pageProps, router }: AppProps) {

  if (router.pathname !== "/plugins/midwestraptor") return (
    <SessionProvider session={pageProps.session}>
      <DefaultHead />
      <GoogleAnalytics
        trackPageViews
        debugMode={process.env.VERCEL_ENV !== "production"}
      />
      <Component {...pageProps} />
    </SessionProvider>
  );

  return (
    <>
      <DefaultHead />
      <Component {...pageProps} />
    </>
  );
}

export default App;
