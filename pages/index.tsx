import type { NextPage, GetStaticPropsContext, GetStaticPropsResult } from 'next';
import type { SeoOrFaviconTag, OgMetaAttributes } from 'react-datocms';
import Head from 'next/head';
import Script from 'next/script';
import { renderMetaTags } from "react-datocms";

import { DATOCMS_Fetch } from '../lib/gql';
import Navbar, { type NavProps } from '../components/Navbar';
import ModuleContent from '../components/ModuleContent';
import Footer from '../components/Footer';
import HomePageQuery from '../gql/queries/home';
import type { ModulerContent } from '../lib/types';

interface HomeContent extends NavProps {
  _site: {
    faviconMetaTags: SeoOrFaviconTag[];
  }
  home: {
    _seoMetaTags: SeoOrFaviconTag[];
    bodyContent:  ModulerContent[]
  }
}

export async function getStaticProps(context: GetStaticPropsContext): Promise<GetStaticPropsResult<HomeContent>> {

  const data = await DATOCMS_Fetch<HomeContent>(HomePageQuery, { preview: context.preview });

  return {
    props: {
      ...data
    },
    // 12 hours
    revalidate: 43200
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
        <Navbar {...navbar} mode="fade-scroll"/>
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
