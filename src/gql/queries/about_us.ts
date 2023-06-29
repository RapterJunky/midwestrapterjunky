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
          content
        }
      }
      image
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
/*
{
            url
            blurUpThumb
            alt
            responsiveImage {
              sizes
            }
          }
 */
/*
{
        alt
        blurUpThumb
        responsiveImage {
          sizes
        }
        url
      }
*/
