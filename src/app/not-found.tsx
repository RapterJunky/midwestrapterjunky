
import type { Metadata } from "next";

import NotFoundPage from "@/components/pages/notfound/NotFoundPage";
import getFullPageProps from "@/lib/services/getFullPageProps";
import getSeoTags from "@/lib/helpers/getSeoTags";

export async function generateMetadata(): Promise<Metadata> {
    const data = await getFullPageProps();

    return getSeoTags({
        datocms: data.site.faviconMetaTags,
        seo: {
            title: "Not Found",
            description: "The page your looking for does not exist",
            slug: "/not-found",
            robots: false
        }
    })
}

export default function NotFound() {
    return (
        <NotFoundPage />
    );
}