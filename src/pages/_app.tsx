import Head from 'next/head';
import { Inter } from '@next/font/google';
import type { AppProps } from 'next/app';

import '@fontsource/inter/variable-full.css';
import '../styles/globals.css';

const inter = Inter({
  variable: "--inter-font"
});

function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta charSet="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>  
      </Head> 
      <Component {...pageProps} />
    </>
  );
}

export default App;
