import Navbar from '../fragments/Navbar';
import EmailCallToActionFragment from '../fragments/EmailCallToAction';
import CustomHtmlSectionFragment from '../fragments/CustomHtmlSection';
import SiteTags from '../fragments/SiteTags';

export default `
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
          content {
            url
            blurUpThumb
            alt
            responsiveImage {
              sizes
            }
          }
        }
      }
      image {
        alt
        blurUpThumb
        responsiveImage {
          sizes
        }
        url
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