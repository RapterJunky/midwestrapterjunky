import CarouselFragment from '../fragments/Carousel';
import EmailCallToActionFragment from '../fragments/EmailCallToAction';
import UpcomingEventsWithImage from '../fragments/UpcomingEventsWithImage';
import UpcomingEvent from '../fragments/UpcomingEvent';
import TestimonialAndShare from '../fragments/TestimonialAndShare';
import FeaturedShop from '../fragments/FeaturedShop';
import Navbar from '../fragments/Navbar';

export default `
    query HomePage { 
        home {
            bodyContent {
                ...CRFragment
                ...ECTAFragment
                ...TASFragment
                ...UERFragment
                ...UEWIRFragment
                ...FSFragment
            }
            metatags {
                description
                title
                twitterCard
                image {
                alt
                author
                url
                title
                smartTags
                    tags
                }
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
${Navbar}
`;