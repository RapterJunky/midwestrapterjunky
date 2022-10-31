import Head from "next/head";
import Script from "next/script";


export default function TestPlugin() {
    return (
        <div>
            <Head>
                <link href="https://unpkg.com/datocms-plugins-sdk/dist/sdk.css" media="all" rel="stylesheet" />
            </Head>

            <Script src="https://unpkg.com/datocms-plugins-sdk" />
        </div>
    );
}