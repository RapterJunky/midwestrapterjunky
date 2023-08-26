import ImageHelper from "../fragments/ImageHelper";
const SponsorsQuery = `
query SponsorsQuery {
    site: _site {
        faviconMetaTags {
          attributes
          content
          tag
        }
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
`;

export default SponsorsQuery;
