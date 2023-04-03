import { GoogleAnalytics } from "nextjs-google-analytics";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import type { NextComponentType, NextPageContext } from 'next';
import Head from "next/head";

import "@fontsource/inter/variable-full.css";
import "../styles/globals.css";



interface CustomAppProps extends AppProps {
  Component: NextComponentType<NextPageContext, any, any> & { provider?: React.FC; }
}

const Noop: React.FC<React.PropsWithChildren> = ({ children }) => (<>{children}</>);

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
      <SessionProvider session={pageProps.session}>
        <DefaultHead />
        <GoogleAnalytics
          trackPageViews
          debugMode={process.env.VERCEL_ENV !== "production"}
        />
        <ContextProvider>
          <Component {...pageProps} />
        </ContextProvider>
      </SessionProvider>
    );
  }

  return (
    <>
      <DefaultHead />
      <Component {...pageProps} />
    </>
  );
}

export default App;
