import {
  StructuredText,
  type StructuredTextGraphQlResponse,
} from "react-datocms/structured-text";
import type {
  OgMetaAttributes,
  RegularMetaAttributes,
  SeoOrFaviconTag,
} from "react-datocms/seo";
import type {
  GetStaticPropsContext,
  GetStaticPropsResult,
  NextPage,
} from "next";

import ScrollToTop from "@components/blog/ScrollToTop";
import Footer from "@components/layout/Footer";
import Navbar from "@components/layout/Navbar";
import SiteTags from "@components/SiteTags";

import terms_of_service from "@query/queries/terms_of_service";
import type { FullPageProps } from "@type/page";
import { DatoCMS } from "@api/gql";

interface Props extends FullPageProps {
  terms: {
    _seoMetaTags: SeoOrFaviconTag[];
    _updatedAt: string | null;
    termsOfServiceSeo: {
      title: string | null;
      twitterCard: string | null;
      description: string | null;
    };
    termsOfService: StructuredTextGraphQlResponse;
  };
}

export const getStaticProps = async (
  ctx: GetStaticPropsContext
): Promise<GetStaticPropsResult<Props>> => {
  const props = await DatoCMS<Props>(terms_of_service, {
    preview: ctx.preview,
  });

  props.terms._seoMetaTags = props.terms._seoMetaTags.map((tag) => {
    if (tag.tag === "title") {
      return {
        ...tag,
        content: props.terms.termsOfServiceSeo?.title ?? "Raptor",
      };
    }
    if (
      tag.tag === "meta" &&
      ((tag.attributes as OgMetaAttributes)?.property === "og:title" ||
        (tag.attributes as RegularMetaAttributes).name === "twitter:title")
    ) {
      tag.attributes.content = props.terms.termsOfServiceSeo?.title ?? "Rapter";
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
        props.terms.termsOfServiceSeo.description ?? "Midwest Rapter Junkies";
      return tag;
    }
    return tag;
  });

  return {
    props: {
      ...props,
      preview: ctx.preview ?? false,
    },
  };
};

const TermsOfService: NextPage<Props> = ({ _site, navbar, terms }) => {
  return (
    <div className="flex h-full flex-col">
      <SiteTags tags={[_site.faviconMetaTags, terms._seoMetaTags]} />
      <header>
        <Navbar {...navbar} mode="only-scroll" />
      </header>
      <main className="flex flex-1 justify-center">
        <article className="lg:prose-md prose prose-sm mx-4 my-8 md:prose-base">
          <div className="h-20"></div>
          <h1>Terms of Service</h1>
          <p>
            Last updated:{" "}
            {new Date(terms._updatedAt ?? new Date()).toLocaleString("en", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <StructuredText data={terms.termsOfService} />
        </article>
      </main>
      <ScrollToTop comments={false} />
      <Footer />
    </div>
  );
};

export default TermsOfService;
