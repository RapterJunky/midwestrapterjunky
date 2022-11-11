import CarouselFragment from '../fragments/Carousel';
import EmailCallToActionFragment from '../fragments/EmailCallToAction';
import UpcomingEventsWithImage from '../fragments/UpcomingEventsWithImage';
import UpcomingEvent from '../fragments/UpcomingEvent';
import TestimonialAndShare from '../fragments/TestimonialAndShare';
import FeaturedShop from '../fragments/FeaturedShop';
import Navbar from '../fragments/Navbar';
import AdvertBlock from '../fragments/AdvertBlock';
import SocialLinks from '../fragments/SocialLinks';
import ImageGallery from '../fragments/ImageGallery';
import VideoWithLink from '../fragments/VideoWithLink';

export default `
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
${FeaturedShop}
${AdvertBlock}
${SocialLinks}
${ImageGallery}
${VideoWithLink}
${Navbar}
`;