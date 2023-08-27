import { type OgMetaAttributes, type RegularMetaAttributes, type SeoOrFaviconTag, toNextMetadata } from "react-datocms/seo";
import { StructuredText, type StructuredTextGraphQlResponse } from "react-datocms/structured-text";
import type { Metadata } from "next";

import ScrollToTop from "@/components/blog/ScrollToTop";
import privcy_policy from "@/gql/queries/privacy_policy";
import getPageQuery from "@/lib/cache/GetPageQuery";
import type { FullPageProps } from "@/types/page";

interface Props extends FullPageProps {
    policy: {
        seo: SeoOrFaviconTag[]
        updatedAt: string;
        privacyPolicy: StructuredTextGraphQlResponse;
        privacyPolicySeo: {
            description: string | null;
            title: string | null;
            twitterCard: string | null;
        }
    }
}

export async function generateMetadata(): Promise<Metadata> {
    const data = await getPageQuery<Props>(privcy_policy);

    const moddedTags = data.policy.seo.map((tag) => {
        if (tag.tag === "title") {
            return {
                ...tag,
                content: data.policy.privacyPolicySeo?.title ?? "Rapter",
            };
        }
        if (
            tag.tag === "meta" &&
            ((tag.attributes as OgMetaAttributes)?.property === "og:title" ||
                (tag.attributes as RegularMetaAttributes).name === "twitter:title")
        ) {
            tag.attributes.content = data.policy.privacyPolicySeo?.title ?? "Rapter";
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
                data.policy.privacyPolicySeo.description ?? "Midwest Rapter Junkies";
            return tag;
        }
        return tag;
    });

    return toNextMetadata([...data.site.faviconMetaTags, ...moddedTags]);
}

const PrivacyPolicy: React.FC = async () => {
    const data = await getPageQuery<Props>(privcy_policy);

    return (
        <div className="flex justify-center">
            <article className="lg:prose-md prose prose-sm mx-4 my-8 md:prose-base">
                <div className="h-20"></div>
                <h1>Privacy Policy</h1>
                <span>
                    Last updated:{" "}
                    {new Date(data.policy.updatedAt ?? new Date()).toLocaleString("en", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                    })}
                </span>
                <StructuredText data={data.policy.privacyPolicy} />
                <ScrollToTop comments={false} />
            </article>
        </div>
    );
}

export default PrivacyPolicy;