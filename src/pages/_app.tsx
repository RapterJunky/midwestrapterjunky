import type { NextComponentType, NextPageContext } from "next";
import { SWRConfig, type SWRConfiguration } from "swr";
import { SessionProvider } from "next-auth/react";
import { Inter } from "next/font/google";
import type { AppProps } from "next/app";
import type { Session } from "next-auth";
import Head from "next/head";
import GoogleAnalytics from "@components/pages/GoogleAnalytics";

import "../styles/globals.css";

interface CustomAppProps extends AppProps<{ session?: Session }> {
  Component: NextComponentType<NextPageContext, object, object> & {
    provider?: React.FC;
  };
}

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const swrConfig = {
  revalidateOnFocus: false,
} satisfies SWRConfiguration;

const Noop: React.FC<React.PropsWithChildren> = ({ children }) => (
  <>{children}</>
);

const DefaultHead: React.FC = () => (
  <Head>
    <meta charSet="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>{`:root { --font-inter: ${inter.style.fontFamily} }`}</style>
  </Head>
);

function App({ Component, pageProps, router }: CustomAppProps) {
  if (router.pathname !== "/plugins/midwestraptor") {
    const ContextProvider = Component?.provider ?? Noop;
    return (
      <SessionProvider session={pageProps?.session}>
        <DefaultHead />
        <GoogleAnalytics debug={process.env.VERCEL_ENV !== "production"} />
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
