import TestimonialAndShare, { type TestimonialAndShareProps } from "@components/pages/home/TestimonialAndShare";
import EmailCallToAction, { type EmailCallToActionProps } from "@components/pages/home/EmailCallToAction";
import FeaturedShopItems, { type FeatureShopItemsProps } from "@components/pages/home/FeaturedShopItems";
import UpcomingEvents, { type UpcomingEventsProps } from "@components/pages/home/UpcomingEvents";
import VideoWithLinks, { type VideoWithLinksProps } from "@components/pages/home/VideoWithLink";
import UpcomingEvent, { type UpcomingEventProps } from "@/components/pages/home/UpcomingEvent";
import ImageGallery, { type ImageGalleryProps } from "@components/pages/home/ImageGallery";
import CountdownSection, { type CountDownProps } from "@components/pages/home/Countdown";
import SocialLinks, { type SocialLinksProps } from "@components/pages/home/SocialLinks";
import AdvertBlock, { type AdvertBlockProps } from "@components/pages/home/AdvertBlock";
import Carousel, { type CarouselProps } from "@/components/pages/home/Carousel";
import HtmlSection from "@components/pages/home/HtmlSection";

import type { ModulerContent } from "@/types/page";

const ModuleContent: React.FC<{ modules: ModulerContent[] }> = ({ modules }) => {
    return (
        <>
            {modules.map((module, i) => {
                switch (module.__typename) {
                    case "CarouselRecord":
                        return (<Carousel {...module as CarouselProps} key={i} />);
                    case "UpcomingeventRecord":
                        return (<UpcomingEvent {...module as UpcomingEventProps} />);
                    case "UpcomingeventswithimageRecord":
                        return (<UpcomingEvents {...module as UpcomingEventsProps} />);
                    case "FeaturedshopRecord":
                        return (<FeaturedShopItems {...module as FeatureShopItemsProps} />);
                    case "ImageGalleryRecord":
                        return (<ImageGallery {...module as ImageGalleryProps} />);
                    case "VideowithlinkRecord":
                        return (<VideoWithLinks {...module as VideoWithLinksProps} />);
                    case "EmailCallToActionRecord":
                        return (<EmailCallToAction {...module as EmailCallToActionProps} />);
                    case "TestimonialAndShareRecord":
                        return (<TestimonialAndShare {...module as TestimonialAndShareProps} />);
                    case "SocialLinksBlockRecord":
                        return (<SocialLinks {...module as SocialLinksProps} />);
                    case "AdvertBlockRecord":
                        return (<AdvertBlock {...module as AdvertBlockProps} />);
                    case "CustomHtmlSectionRecord":
                        return (<HtmlSection {...module} />);
                    case "CountdownRecord":
                        return (<CountdownSection {...module as CountDownProps} />);
                    default:
                        return null;
                }
            })}
        </>
    );
}

export default ModuleContent;