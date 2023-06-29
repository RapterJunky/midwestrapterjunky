import Navbar from "../fragments/Navbar";
import EmailCallToActionFragment from "../fragments/EmailCallToAction";
import CustomHtmlSectionFragment from "../fragments/CustomHtmlSection";
import SiteTags from "../fragments/SiteTags";

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
          content {
            responsiveImage {
              sizes
              src
              alt
              height
              width
            }
            blurUpThumb
          }
        }
      }
      image {
        responsiveImage {
          sizes
          src
          alt
          height
          width
        }
        blurUpThumb
      }
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
