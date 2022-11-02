import type { NextPage, GetStaticPropsContext, GetStaticPropsResult } from 'next';
import Head from 'next/head';
import { GQLFetch, NavbarFragment } from '../lib/gql';
import Navbar from '../components/Navbar';
import Script from 'next/script';
import ModuleContent from '../components/ModuleContent';
import Footer from '../components/Footer';

const query = `
query HomePage {
  home {
    bodyContent {
      ... on UpcomingeventswithimageRecord {
        events {
          eventLink {
            dateFrom
            dateTo
            title
            id
          }
          bgImage {
            url
            alt
          }
        }
        _modelApiKey
      }
      ... on CarouselRecord {
        images {
          url
          alt
        }
        _modelApiKey
      }
      ... on UpcomingeventRecord {
        event {
          description {
            blocks
            links
            value
          }
        }
        textColor {
          hex
        }
        backgroundColor {
          hex
        }
        _modelApiKey
      }
      ... on EmailCallToActionRecord {
        callToActionMessage {
          value
          links
          blocks
        }
        backgroundColor {
          hex
        }
        _modelApiKey
      }
    }
    metatags {
      description
      title
      twitterCard
      image {
        alt
        author
        url
        title
        smartTags
        tags
      }
    }
  }
  ${NavbarFragment}
}`;


export async function getStaticProps(context: GetStaticPropsContext): Promise<GetStaticPropsResult<any>> {

  const data = await GQLFetch(query, { preview: context.preview });

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
