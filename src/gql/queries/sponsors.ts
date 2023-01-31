import Navbar from "../fragments/Navbar";
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
        logo {
          responsiveImage {
            alt
            sizes
            src
          }
          blurUpThumb
        }
      }
    }
  }
  ${Navbar}
`;

export default SponsorsQuery;
