import { Head, Html, Main, NextScript } from "next/document";
import Script from "next/script";

export default function Document(ctx: any){
    return (
        <Html lang="en">
            <Head>
                { ctx.dangerousAsPath.startsWith("/plugins") ? <link href="https://unpkg.com/datocms-plugins-sdk/dist/sdk.css" media="all" rel="stylesheet" /> : null }
            </Head>
            <body>
                <Main/>
                <NextScript/>
            </body>
        </Html>
    );
}