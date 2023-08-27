import {
    StructuredText,
    type StructuredTextGraphQlResponse,
} from "react-datocms/structured-text";
import {
    toNextMetadata,
    type OgMetaAttributes,
    type RegularMetaAttributes,
    type SeoOrFaviconTag,
} from "react-datocms/seo";
import type { Metadata } from "next";
import TermsOfServiceQuery from "@query/queries/terms_of_service";
import ScrollToTop from "@/components/blog/ScrollToTop";
import getPageQuery from "@/lib/cache/GetPageQuery";
import type { FullPageProps } from "@type/page";

interface Props extends FullPageProps {
    terms: {
        seo: SeoOrFaviconTag[];
        updatedAt: string | null;
        termsOfServiceSeo: {
            title: string | null;
            twitterCard: string | null;
            description: string | null;
        };
        termsOfService: StructuredTextGraphQlResponse;
    };
}

export async function generateMetadata(): Promise<Metadata> {
    const data = await getPageQuery<Props>(TermsOfServiceQuery);

    const moddedTags = data.terms.seo.map((tag) => {
        if (tag.tag === "title") {
            return {
                ...tag,
                content: data.terms.termsOfServiceSeo?.title ?? "Raptor",
            };
        }
        if (
            tag.tag === "meta" &&
            ((tag.attributes as OgMetaAttributes)?.property === "og:title" ||
                (tag.attributes as RegularMetaAttributes).name === "twitter:title")
        ) {
            tag.attributes.content = data.terms.termsOfServiceSeo?.title ?? "Rapter";
            return tag;
        }
        if (
            tag.tag === "meta" &&
            ((tag.attributes as OgMetaAttributes)?.property === "og:description" ||
                ["twitter:description", "description"].includes(
                    (tag.attributes as RegularMetaAttributes)?.name,
                ))
        ) {
            tag.attributes.content =
                data.terms.termsOfServiceSeo.description ?? "Midwest Rapter Junkies";
            return tag;
        }
        return tag;
    });

    return toNextMetadata([...data.site.faviconMetaTags, ...moddedTags]);
}

const TermsOfService: React.FC = async () => {
    const data = await getPageQuery<Props>(TermsOfServiceQuery);
    return (
        <div className="flex justify-center">
            <article className="lg:prose-md prose prose-sm mx-4 my-8 md:prose-base">
                <div className="h-20"></div>
                <h1>Terms of Service</h1>
                <p>
                    Last updated:{" "}
                    {new Date(data.terms.updatedAt ?? new Date()).toLocaleString("en", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                    })}
                </p>
                <StructuredText data={data.terms.termsOfService} />
            </article>
            <ScrollToTop comments={false} />
        </div>
    );
}

export default TermsOfService