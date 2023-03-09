import type {
  NextPage,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from "next";
import Script from "next/script";
import type { SeoOrFaviconTag } from "react-datocms";

import Navbar from "@components/Navbar";
import ModuleContent from "@components/ModuleContent";
import ExitPreview from "@components/ExitPreview";
import SiteTags from "@components/SiteTags";
import Footer from "@components/Footer";

import { DatoCMS } from "@api/gql";
import type { FullPageProps, ModulerContent } from "@type/page";
import HomePageQuery from "@query/queries/home";

import { REVAILDATE_IN_12H } from "@lib/revaildateTimings";

interface HomeContent extends FullPageProps {
  home: {
    _seoMetaTags: SeoOrFaviconTag[];
    bodyContent: ModulerContent[];
  };
}

export async function getStaticProps(
  context: GetStaticPropsContext
): Promise<GetStaticPropsResult<HomeContent>> {
  const data = await DatoCMS<HomeContent>(HomePageQuery, {
    preview: context.preview,
  });

  return {
    props: {
      ...data,
      preview: context?.preview ?? false,
    },
    revalidate: REVAILDATE_IN_12H,
  };
}

const Home: NextPage<HomeContent> = ({ preview, navbar, home, _site }) => {
  return (
    <>
      <SiteTags
        ignore={["article:modified_time"]}
        tags={[home._seoMetaTags, _site.faviconMetaTags]}
      />
      <header>
        <Navbar {...navbar} mode="fade-scroll" />
      </header>
      <main className="overflow-x-hidden">
        <ModuleContent data={home.bodyContent} />
      </main>
      <Footer />
      <Script
        onReady={() => {
          /* TW Elements does not seem to execute on load sometimes, so create instances here. 
                                World like to get rid of haveing this script in the frist place but not sandalone 
                                script is ready or react compable */
          document
            .querySelectorAll('[id*="-carousel"]')
            .forEach((value) => window.te.Carousel.getOrCreateInstance(value));
        }}
        src="https://cdn.jsdelivr.net/npm/tw-elements@1.0.0-beta1/dist/js/index.min.js"
        strategy="lazyOnload"
      />
      {preview ? <ExitPreview /> : null}
    </>
  );
};

export default Home;
