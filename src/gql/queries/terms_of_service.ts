import { type SeoOrFaviconTag } from "react-datocms/seo";
import { type StructuredTextGraphQlResponse } from "react-datocms/structured-text";

export type TermsOfServiceResult = {
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
};

const TermsOfService = `
query TermsOfServiceQuery {
    terms: termsandprivacy {
      seo: _seoMetaTags {
        attributes
        content
        tag
      }
      updatedAt: _updatedAt
      termsOfServiceSeo {
        title
        twitterCard
        description
      }
      termsOfService {
        value
        links
        blocks
      }
    }
  }`;

export default TermsOfService;
