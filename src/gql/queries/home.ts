import CarouselFragment from "../fragments/Carousel";
import EmailCallToActionFragment from "../fragments/EmailCallToAction";
import UpcomingEventsWithImage from "../fragments/UpcomingEventsWithImage";
import UpcomingEvent from "../fragments/UpcomingEvent";
import TestimonialAndShare from "../fragments/TestimonialAndShare";
import FeaturedShop from "../fragments/FeaturedShop";
import Navbar from "../fragments/Navbar";
import AdvertBlock from "../fragments/AdvertBlock";
import SocialLinks from "../fragments/SocialLinks";
import ImageGallery from "../fragments/ImageGallery";
import VideoWithLink from "../fragments/VideoWithLink";
import CustomHtmlSection from "../fragments/CustomHtmlSection";
import CountdownFragment from "@query/fragments/CountDown";

const HomePageQuery = `
    query HomePage { 
        _site {
            faviconMetaTags {
              attributes
              content
              tag
            }
        }
        home {
            bodyContent {
                ...CRFragment
                ...ECTAFragment
                ...TASFragment
                ...UERFragment
                ...UEWIRFragment
                ...FSFragment
                ...ABFragment
                ...SLFragment
                ...IGFragment
                ...VWLFragment
                ...CHSFragment
                ...CountdownFragment
            }
            _seoMetaTags {
                attributes
                content
                tag
            }
        }
        navbar {
            ...NavbarRecordFragment
        }
    }
${CarouselFragment}
${EmailCallToActionFragment}
${TestimonialAndShare}
${UpcomingEvent}
${UpcomingEventsWithImage}
${CustomHtmlSection}
${FeaturedShop}
${AdvertBlock}
${SocialLinks}
${ImageGallery}
${VideoWithLink}
${Navbar}
${CountdownFragment}
`;

export default HomePageQuery;
