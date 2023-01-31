import type {
  NextPage,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from "next";
import type { SeoOrFaviconTag } from "react-datocms";
import Script from "next/script";

import { DATOCMS_Fetch } from "@lib/gql";
import Navbar from "@components/Navbar";
import ModuleContent from "@components/ModuleContent";
import Footer from "@components/Footer";
import HomePageQuery from "@query/queries/home";
import type { FullPageProps, ModulerContent } from "@lib/types";
import ExitPreview from "@components/ExitPreview";
import SiteTags from "@components/SiteTags";

interface HomeContent extends FullPageProps {
  home: {
    _seoMetaTags: SeoOrFaviconTag[];
    bodyContent: ModulerContent[];
  };
}

export async function getStaticProps(
  context: GetStaticPropsContext
): Promise<GetStaticPropsResult<HomeContent>> {
  const data = await DATOCMS_Fetch<HomeContent>(HomePageQuery, {
    preview: context.preview,
  });

  return {
    props: {
      ...data,
      preview: context?.preview ?? false,
    },
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
      <main>
        <ModuleContent data={home.bodyContent} />
      </main>
      <Footer />
      {preview ? <ExitPreview /> : null}
      <Script
        src="https://cdn.jsdelivr.net/npm/tw-elements/dist/js/index.min.js"
        strategy="afterInteractive"
      />
    </>
  );
};

export default Home;
