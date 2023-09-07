import type { SeoOrFaviconTag } from "react-datocms/seo";

import UpcomingEventsWithImage from "../fragments/UpcomingEventsWithImage";
import EmailCallToActionFragment from "../fragments/EmailCallToAction";
import TestimonialAndShare from "../fragments/TestimonialAndShare";
import CustomHtmlSection from "../fragments/CustomHtmlSection";
import CountdownFragment from "@query/fragments/CountDown";
import UpcomingEvent from "../fragments/UpcomingEvent";
import VideoWithLink from "../fragments/VideoWithLink";
import ImageGallery from "../fragments/ImageGallery";
import FeaturedShop from "../fragments/FeaturedShop";
import CarouselFragment from "../fragments/Carousel";
import AdvertBlock from "../fragments/AdvertBlock";
import SocialLinks from "../fragments/SocialLinks";
import type { ModulerContent } from "@/types/page";

export type HomePageQueryResult = {
    home: {
        seo: SeoOrFaviconTag[];
        bodyContent: ModulerContent[];
    };
}

const HomePageQuery = `
    query HomePage { 
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
            seo: _seoMetaTags {
                attributes
                content
                tag
            }
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
${CountdownFragment}
`;

export default HomePageQuery;
