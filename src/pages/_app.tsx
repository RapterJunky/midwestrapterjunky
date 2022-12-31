import Head from 'next/head';
import type { AppProps } from 'next/app';

import '../styles/globals.css';

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
