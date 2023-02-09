import Head from "next/head";
import { GoogleAnalytics } from "nextjs-google-analytics";
import type { AppProps } from "next/app";

import "@fontsource/inter/variable-full.css";
import "../styles/globals.css";

function App({ Component, pageProps, router }: AppProps) {
  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      {router.pathname !== "/plugins/midwestraptor" ? (
        <GoogleAnalytics
          trackPageViews
          debugMode={process.env.VERCEL_ENV !== "production"}
        />
      ) : null}
      <Component {...pageProps} />
    </>
  );
}

export default App;
