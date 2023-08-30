import Navbar from "../fragments/Navbar";
import EmailCallToActionFragment from "../fragments/EmailCallToAction";
import CustomHtmlSectionFragment from "../fragments/CustomHtmlSection";
import SiteTags from "../fragments/SiteTags";

import ImageHelper from "../fragments/ImageHelper";

const AboutUsQuery = `
query AboutUsQuery {
    _site {
      ...SiteFragment
    }
    navbar {
      ...NavbarRecordFragment
    }
    aboutUsModel {
      _seoMetaTags {
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
  ${Navbar}
`;
export default AboutUsQuery;
