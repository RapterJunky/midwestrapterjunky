import Navbar from "../fragments/Navbar";
const terms_of_service = `
query TermsOfServiceQuery {
    terms: termsandprivacy {
      _seoMetaTags {
        attributes
        content
        tag
      }
      _updatedAt
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
    _site {
      faviconMetaTags {
        attributes
        content
        tag
      }
    }
    navbar {
        ...NavbarRecordFragment
    }
  } ${Navbar}`;

export default terms_of_service;
