import {
  type OgMetaAttributes,
  type RegularMetaAttributes,
} from "react-datocms/seo";
import { StructuredText } from "react-datocms/structured-text";
import type { Metadata, ResolvingMetadata } from "next";

import PrivcyPolicyQuery, {
  type PrivcyPolicyQueryResult,
} from "@/gql/queries/privacy_policy";
import ScrollToTop from "@/components/blog/ScrollToTop";
import getPageQuery from "@/lib/services/GetPageQuery";
import getSeoTags from "@/lib/helpers/getSeoTags";

export async function generateMetadata(
  {},
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const data = await getPageQuery<PrivcyPolicyQueryResult>(PrivcyPolicyQuery);

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

  return getSeoTags({
    parent,
    datocms: moddedTags,
  });
}

const PrivacyPolicy: React.FC = async () => {
  const data = await getPageQuery<PrivcyPolicyQueryResult>(PrivcyPolicyQuery);

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
};

export default PrivacyPolicy;
