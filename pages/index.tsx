import type { NextPage, GetStaticPropsContext, GetStaticPropsResult } from 'next';
import Head from 'next/head';
import { GQLFetch } from '../lib/gql';
import Navbar from '../components/Navbar';
import Script from 'next/script';
import ModuleContent from '../components/ModuleContent';
import Footer from '../components/Footer';
import HomePageQuery from '../gql/queries/home';
import SocialMediaAndEvents from '../components/content/SocialMediaAndEvents';

export async function getStaticProps(context: GetStaticPropsContext): Promise<GetStaticPropsResult<any>> {

  const data = await GQLFetch(HomePageQuery, { preview: context.preview });

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
        <SocialMediaAndEvents/>
      </main>
      <Footer/>
      <Script src="https://cdn.jsdelivr.net/npm/tw-elements/dist/js/index.min.js" strategy="afterInteractive"/>
    </>
   );
}

export default Home;
