import { type SeoOrFaviconTag } from "react-datocms/seo";
import { toNextMetadata } from "react-datocms";
import type { Metadata } from "next";

import type { GenericPageResult } from "@/gql/queries/generic";
import ModuleContent from "@/components/layout/ModuleContent";
import getPageQuery from "@/lib/services/GetPageQuery";
import type { ModulerContent } from "@type/page";
import HomePageQuery from "@/gql/queries/home";

interface HomeContent extends GenericPageResult {
  home: {
    seo: SeoOrFaviconTag[];
    bodyContent: ModulerContent[];
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await getPageQuery<HomeContent>(HomePageQuery);
  return toNextMetadata([...data.site.faviconMetaTags, ...data.home.seo]);
}

const Home: React.FC = async () => {
  const data = await getPageQuery<HomeContent>(HomePageQuery);

  return <ModuleContent modules={data.home.bodyContent} />;
};

export default Home;
