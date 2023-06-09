import {
  StructuredText,
  type StructuredTextGraphQlResponse,
} from "react-datocms/structured-text";
import type {
  GetStaticPropsContext,
  GetStaticPropsResult,
  NextPage,
} from "next";
import type {
  OgMetaAttributes,
  RegularMetaAttributes,
  SeoOrFaviconTag,
} from "react-datocms/seo";

import privcy_policy from "@query/queries/privacy_policy";
import ScrollToTop from "@components/blog/ScrollToTop";
import Navbar from "@components/layout/OldNavbar";
import type { FullPageProps } from "@type/page";
import Footer from "@components/layout/Footer";
import SiteTags from "@components/SiteTags";
import { DatoCMS } from "@api/gql";

interface Props extends FullPageProps {
  policy: {
    _seoMetaTags: SeoOrFaviconTag[];
    _updatedAt: string | null;
    privacyPolicy: StructuredTextGraphQlResponse;
    privacyPolicySeo: {
      description: string | null;
      title: string | null;
      twitterCard: string | null;
    };
  };
}

export const getStaticProps = async (
  ctx: GetStaticPropsContext
): Promise<GetStaticPropsResult<Props>> => {
  const props = await DatoCMS<Props>(
    { query: privcy_policy },
    { draft: ctx.draftMode || ctx.preview }
  );

  props.policy._seoMetaTags = props.policy._seoMetaTags.map((tag) => {
    if (tag.tag === "title") {
      return {
        ...tag,
        content: props.policy.privacyPolicySeo?.title ?? "Rapter",
      };
    }
    if (
      tag.tag === "meta" &&
      ((tag.attributes as OgMetaAttributes)?.property === "og:title" ||
        (tag.attributes as RegularMetaAttributes).name === "twitter:title")
    ) {
      tag.attributes.content = props.policy.privacyPolicySeo?.title ?? "Rapter";
      return tag;
    }
    if (
      tag.tag === "meta" &&
      ((tag.attributes as OgMetaAttributes)?.property === "og:description" ||
        ["twitter:description", "description"].includes(
          (tag.attributes as RegularMetaAttributes)?.name
        ))
    ) {
      tag.attributes.content =
        props.policy.privacyPolicySeo.description ?? "Midwest Rapter Junkies";
      return tag;
    }
    return tag;
  });

  return {
    props: {
      ...props,
      preview: (ctx.draftMode || ctx.preview) ?? false,
    },
  };
};

const PrivacyPolicy: NextPage<Props> = ({ _site, navbar, policy }) => {
  return (
    <div className="flex h-full flex-col">
      <SiteTags
        tags={[
          _site.faviconMetaTags,
          policy._seoMetaTags,
          [
            {
              tag: "meta",
              attributes: {
                property: "og:url",
                content: "https://midwestraptorjunkies.com/privacy-policy",
              },
            },
          ],
        ]}
      />
      <header>
        <Navbar {...navbar} mode="only-scroll" />
      </header>
      <main className="flex flex-1 justify-center">
        <article className="lg:prose-md prose prose-sm mx-4 my-8 md:prose-base">
          <div className="h-20"></div>
          <h1>Privacy Policy</h1>
          <span>
            Last updated:{" "}
            {new Date(policy._updatedAt ?? new Date()).toLocaleString("en", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
          <StructuredText data={policy.privacyPolicy} />
        </article>
      </main>
      <ScrollToTop comments={false} />
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
