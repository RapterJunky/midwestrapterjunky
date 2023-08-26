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
    site: _site {
      faviconMetaTags {
        attributes
        content
        tag
      }
    }
  }`;

export default TermsOfService;
