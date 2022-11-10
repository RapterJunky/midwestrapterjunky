import type { NextPage, GetStaticPropsContext, GetStaticPropsResult } from 'next';
import Head from 'next/head';
import { DATOCMS_Fetch, Shopify_Fetch } from '../lib/gql';
import Navbar from '../components/Navbar';
import Script from 'next/script';
import ModuleContent from '../components/ModuleContent';
import Footer from '../components/Footer';
import HomePageQuery from '../gql/queries/home';

export async function getStaticProps(context: GetStaticPropsContext): Promise<GetStaticPropsResult<any>> {

  const data = await DATOCMS_Fetch<{ home: { bodyContent: { _modelApiKey: string; [key: string]: any; }[] } }>(HomePageQuery, { preview: context.preview });

  // right now this only handles one featured shop content.
  const shopIdx = data.home.bodyContent.findIndex(value=>value._modelApiKey === "featuredshop");
  if(shopIdx !== -1) {
    const keys: string[] = data.home.bodyContent[shopIdx].items.map((value: { item: string; id: string; })=>
       `
        item_${value.id}: productByHandle(handle: "${value.item}") {
          featuredImage {
            altText
            url
          }
          title
          handle
          onlineStoreUrl
          priceRange {
            maxVariantPrice {
              amount
              currencyCode
            }
            minVariantPrice {
              amount
              currencyCode
            }
          }
        }
      `);
    const query = `
      query GetStoreItems {
        ${keys.join("\n")}
      }
    `;
    const shopData = await Shopify_Fetch(query);
    data.home.bodyContent[shopIdx].items = shopData;
  }

  return {
    props: {
      ...data
    }
  }
}

const Home: NextPage = ({ navbar, home }: any) => {
   return (
    <>
      <Head>
        <title>{home.metatags.title}</title>
        <meta name="description" content={home.metatags.description} />
      </Head>
      <header>
        <Navbar {...navbar}/>
      </header>
      <main>
        <ModuleContent data={home.bodyContent}/>
      </main>
      <Footer/>
      <Script src="https://cdn.jsdelivr.net/npm/tw-elements/dist/js/index.min.js" strategy="afterInteractive"/>
    </>
   );
}

export default Home;
