import EmailCallToActionFragment from "../fragments/EmailCallToAction";
import CustomHtmlSectionFragment from "../fragments/CustomHtmlSection";
import SiteTags from "../fragments/SiteTags";

import ImageHelper from "../fragments/ImageHelper";

const AboutUsQuery = `
query AboutUsQuery {
    site: _site {
      ...SiteFragment
    }
    aboutUsModel {
      seo: _seoMetaTags {
        attributes
        content
        tag
      }
      imageTitle
      title
      content {
        links {
          slug
          title
          dateFrom
          dateTo
        }
        value
        blocks {
          id
          __typename
          content ${ImageHelper("aboutus")}
        }
      }
      image ${ImageHelper("aboutus")}
      footerContent {
        ...ECTAFragment
        ...CHSFragment
      }
    }
  }
  ${SiteTags}
  ${EmailCallToActionFragment}
  ${CustomHtmlSectionFragment}
`;
export default AboutUsQuery;
