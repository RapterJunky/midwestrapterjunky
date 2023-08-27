import { type SeoOrFaviconTag } from "react-datocms/seo";
import { toNextMetadata } from "react-datocms";
import type { Metadata } from "next";

import type { FullPageProps, ModulerContent } from "@type/page";
import getPageQuery from "@/lib/cache/GetPageQuery";
import HomePageQuery from "@/gql/queries/home";
import ModuleContent from "@/components/layout/ModuleContent";

interface HomeContent extends FullPageProps {
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

    return (
        <ModuleContent modules={data.home.bodyContent} />
    );
}

export default Home;