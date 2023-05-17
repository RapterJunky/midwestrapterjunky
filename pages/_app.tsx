import '../styles/globals.css'
import { GoogleAnalytics } from "nextjs-google-analytics";
import type { AppProps } from 'next/app'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
    <GoogleAnalytics trackPageViews/>
    <Component {...pageProps} />
    </>
  );
}

export default MyApp;
