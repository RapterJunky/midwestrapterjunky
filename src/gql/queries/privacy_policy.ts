import Navbar from "../fragments/Navbar";
const privcy_policy = `
query PrivcyPolicyQuery {
    policy: termsandprivacy {
      _seoMetaTags {
        attributes
        content
        tag
      }
      _updatedAt
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
  }
  ${Navbar}
`;

export default privcy_policy;
