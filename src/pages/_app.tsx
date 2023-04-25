import type { NextComponentType, NextPageContext } from "next";
import { GoogleAnalytics } from "nextjs-google-analytics";
import { SWRConfig, type SWRConfiguration } from 'swr';
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import type { Session } from "next-auth";

import Head from "next/head";

import "@fontsource/inter/variable-full.css";
import "../styles/globals.css";

interface CustomAppProps extends AppProps<{ session?: Session }> {
  Component: NextComponentType<NextPageContext, object, object> & {
    provider?: React.FC;
  };
}

const swrConfig = {
  revalidateOnFocus: false
} satisfies SWRConfiguration;

const Noop: React.FC<React.PropsWithChildren> = ({ children }) => (
  <>{children}</>
);

const DefaultHead: React.FC = () => (
  <Head>
    <meta charSet="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </Head>
);

function App({ Component, pageProps, router }: CustomAppProps) {
  if (router.pathname !== "/plugins/midwestraptor") {
    const ContextProvider = Component?.provider ?? Noop;
    return (
      <SessionProvider session={pageProps?.session}>
        <DefaultHead />
        <GoogleAnalytics
          trackPageViews
          debugMode={process.env.VERCEL_ENV !== "production"}
        />
        <SWRConfig value={swrConfig}>
          <ContextProvider>
            <Component {...pageProps} />
          </ContextProvider>
        </SWRConfig>
      </SessionProvider>
    );
  }

  return (
    <SWRConfig value={swrConfig}>
      <DefaultHead />
      <Component {...pageProps} />
    </SWRConfig>
  );
}

export default App;
