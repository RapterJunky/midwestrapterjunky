import AdvertBlock from "../fragments/AdvertBlock";
import CarouselFragment from "../fragments/Carousel";
import CustomHtmlSection from "../fragments/CustomHtmlSection";
import EmailCallToActionFragment from "../fragments/EmailCallToAction";
import FeaturedShop from "../fragments/FeaturedShop";
import ImageGallery from "../fragments/ImageGallery";
import ImageRecordFragment from "../fragments/SingleImage";
import SocialLinks from "../fragments/SocialLinks";
import TestimonialAndShare from "../fragments/TestimonialAndShare";
import UpcomingEvent from "../fragments/UpcomingEvent";
import UpcomingEventsWithImage from "../fragments/UpcomingEventsWithImage";
import VideoWithLink from "../fragments/VideoWithLink";
import type { SeoOrFaviconTag } from "react-datocms/seo";
import type { ModulerContent } from "@/types/page";
import CountdownFragment from "@query/fragments/CountDown";

export type HomePageQueryResult = {
  home: {
    seo: SeoOrFaviconTag[];
    bodyContent: ModulerContent[];
  };
};

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
                ...ImageRecordFragment
            }
            seo: _seoMetaTags {
                attributes
                content
                tag
            }
        }
    }
${ImageRecordFragment}
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
