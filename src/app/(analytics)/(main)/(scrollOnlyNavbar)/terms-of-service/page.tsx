import { StructuredText } from "react-datocms/structured-text";
import {
  type OgMetaAttributes,
  type RegularMetaAttributes,
} from "react-datocms/seo";
import type { Metadata, ResolvingMetadata } from "next";
import TermsOfServiceQuery, {
  type TermsOfServiceResult,
} from "@query/queries/terms_of_service";
import ScrollToTop from "@/components/blog/ScrollToTop";
import getPageQuery from "@/lib/services/GetPageQuery";
import getSeoTags from "@/lib/helpers/getSeoTags";

export async function generateMetadata(
  {},
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const data = await getPageQuery<TermsOfServiceResult>(TermsOfServiceQuery);

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

  return getSeoTags({
    parent,
    slug: "/terms-of-service",
    datocms: moddedTags,
  });
}

const TermsOfService: React.FC = async () => {
  const data = await getPageQuery<TermsOfServiceResult>(TermsOfServiceQuery);
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
};

export default TermsOfService;
