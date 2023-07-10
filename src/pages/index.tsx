import type {
  NextPage,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from "next";
import type { SeoOrFaviconTag } from "react-datocms";

import type { FullPageProps, ModulerContent } from "types/page";
import ModuleContent from "@components/layout/ModuleContent";
import { REVAILDATE_IN_12H } from "@lib/revaildateTimings";
import ExitPreview from "@components/ui/ExitPreview";
import Navbar from "@components/layout/OldNavbar";
import HomePageQuery from "@query/queries/home";
import Footer from "@components/layout/Footer";
import SiteTags from "@components/SiteTags";
import { DatoCMS } from "@api/gql";

interface HomeContent extends FullPageProps {
  home: {
    _seoMetaTags: SeoOrFaviconTag[];
    bodyContent: ModulerContent[];
  };
}

export async function getStaticProps(
  context: GetStaticPropsContext,
): Promise<GetStaticPropsResult<HomeContent>> {
  const data = await DatoCMS<HomeContent>(
    { query: HomePageQuery },
    {
      draft: context.draftMode || context.preview,
    },
  );

  if (!data) throw new Error("Failed to get page content");

  return {
    props: {
      ...data,
      preview: (context.draftMode || context.preview) ?? false,
    },
    revalidate: REVAILDATE_IN_12H,
  };
}

const Home: NextPage<HomeContent> = ({ preview, navbar, home, _site }) => {
  return (
    <>
      <SiteTags
        ignore={["article:modified_time"]}
        tags={[
          home._seoMetaTags,
          _site.faviconMetaTags,
          [
            {
              tag: "meta",
              attributes: {
                property: "og:url",
                content: "https://midwestraptorjunkies.com",
              },
            },
          ],
        ]}
      />
      <header>
        <Navbar {...navbar} mode="fade-scroll" />
      </header>
      <main className="overflow-x-hidden">
        <ModuleContent data={home.bodyContent} />
      </main>
      <Footer />
      {preview ? <ExitPreview /> : null}
    </>
  );
};

export default Home;
