import type { SeoOrFaviconTag } from "react-datocms/seo";
import type { StructuredTextGraphQlResponse } from "react-datocms/structured-text";

export type PrivcyPolicyQueryResult = {
  policy: {
    seo: SeoOrFaviconTag[];
    updatedAt: string;
    privacyPolicy: StructuredTextGraphQlResponse;
    privacyPolicySeo: {
      description: string | null;
      title: string | null;
      twitterCard: string | null;
    };
  };
};

const PrivcyPolicy = `
query PrivcyPolicyQuery {
    policy: termsandprivacy {
      seo: _seoMetaTags {
        attributes
        content
        tag
      }
      updatedAt: _updatedAt
      privacyPolicy {
        blocks
        links
        value
      }
      privacyPolicySeo {
        description
        title
        twitterCard
      }
    }
  }
`;

export default PrivcyPolicy;
