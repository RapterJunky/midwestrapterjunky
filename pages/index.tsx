import type { NextPage, GetStaticPropsContext, GetStaticPropsResult } from 'next';
import type { SeoOrFaviconTag, OgMetaAttributes } from 'react-datocms';
import Head from 'next/head';
import Script from 'next/script';
import { renderMetaTags } from "react-datocms";
import { DATOCMS_Fetch, Shopify_Fetch } from '../lib/gql';
import Navbar, { type NavProps } from '../components/Navbar';
import ModuleContent from '../components/ModuleContent';
import Footer from '../components/Footer';
import HomePageQuery from '../gql/queries/home';

interface HomeContent extends NavProps {
  _site: {
    faviconMetaTags: SeoOrFaviconTag[];
  }
  home: {
    _seoMetaTags: SeoOrFaviconTag[];
    bodyContent:  { _modelApiKey: string; [key: string]: any; }[]
  }
}


export async function getStaticProps(context: GetStaticPropsContext): Promise<GetStaticPropsResult<HomeContent>> {

  const data = await DATOCMS_Fetch<HomeContent>(HomePageQuery, { preview: context.preview });

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

const Home: NextPage<HomeContent> = ({ navbar, home, _site}) => {
   return (
    <>
      <Head>
          {renderMetaTags([
            ...home._seoMetaTags.filter(value=>(value.attributes as OgMetaAttributes | null)?.property !== "article:modified_time"),
            ..._site.faviconMetaTags
          ])}
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
