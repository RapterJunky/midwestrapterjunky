import type { Metadata, ResolvingMetadata } from "next";

import ModuleContent from "@/components/layout/ModuleContent";
import getPageQuery from "@/lib/services/GetPageQuery";
import HomePageQuery, { type HomePageQueryResult } from "@/gql/queries/home";
import getSeoTags from "@/lib/helpers/getSeoTags";

export async function generateMetadata(
  { },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  try {
    const { home } = await getPageQuery<HomePageQueryResult>(HomePageQuery);

    return getSeoTags({
      datocms: home.seo,
      parent,
      slug: "/",
      metadata: {
        verification: {
          google: process.env.GOOGLE_SITE_VERIFICATION,
        }
      }
    })
  } catch (error) {
    return getSeoTags({
      parent,
      metadata: {
        title: "Internal Error",
      },
    });
  }
}

const Home: React.FC = async () => {
  const data = await getPageQuery<HomePageQueryResult>(HomePageQuery);

  return <ModuleContent modules={data.home.bodyContent} />;
};

export default Home;
