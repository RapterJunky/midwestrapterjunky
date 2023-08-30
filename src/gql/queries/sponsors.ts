import Navbar from "../fragments/Navbar";
import ImageHelper from "../fragments/ImageHelper";
const SponsorsQuery = `
query SponsorsQuery {
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
    sponsor {
      seo: _seoMetaTags {
        attributes
        content
        tag
      }
      sponsors {
        link
        id
        sponsorName
        logo ${ImageHelper("sponsor")}
      }
    }
  }
  ${Navbar}
`;

export default SponsorsQuery;
