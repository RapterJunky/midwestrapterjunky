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
    site: _site {
      faviconMetaTags {
        attributes
        content
        tag
      }
    }
  }
`;

export default PrivcyPolicy;
