import TestimonialAndShare, {
  type TestimonialAndShareProps,
} from "@components/pages/home/TestimonialAndShare";
import EmailCallToAction, {
  type EmailCallToActionProps,
} from "@components/pages/home/EmailCallToAction";
import FeaturedShopItems, {
  type FeatureShopItemsProps,
} from "@components/pages/home/FeaturedShopItems";
import UpcomingEvents, {
  type UpcomingEventsProps,
} from "@components/pages/home/UpcomingEvents";
import VideoWithLinks, {
  type VideoWithLinksProps,
} from "@components/pages/home/VideoWithLink";
import UpcomingEvent, {
  type UpcomingEventProps,
} from "@/components/pages/home/UpcomingEvent";
import ImageGallery, {
  type ImageGalleryProps,
} from "@components/pages/home/ImageGallery";
import CountdownSection, {
  type CountDownProps,
} from "@components/pages/home/Countdown";
import SocialLinks, {
  type SocialLinksProps,
} from "@components/pages/home/SocialLinks";
import AdvertBlock, {
  type AdvertBlockProps,
} from "@components/pages/home/AdvertBlock";
import Carousel, { type CarouselProps } from "@/components/pages/home/Carousel";
import HtmlSection from "@components/pages/home/HtmlSection";

import type { ModulerContent } from "@/types/page";
import SingleImage, { type SingleImageProps } from "../pages/home/SingleImage";

const ModuleContent: React.FC<{ modules: ModulerContent[] }> = ({
  modules,
}) => {
  return (
    <>
      {modules.map((module, i) => {
        switch (module.__typename) {
          case "CarouselRecord":
            return <Carousel {...(module as CarouselProps)} key={i} />;
          case "UpcomingeventRecord":
            return (
              <UpcomingEvent {...(module as UpcomingEventProps)} key={i} />
            );
          case "UpcomingeventswithimageRecord":
            return (
              <UpcomingEvents {...(module as UpcomingEventsProps)} key={i} />
            );
          case "FeaturedshopRecord":
            return (
              <FeaturedShopItems
                {...(module as FeatureShopItemsProps)}
                key={i}
              />
            );
          case "ImageGalleryRecord":
            return <ImageGallery {...(module as ImageGalleryProps)} key={i} />;
          case "VideowithlinkRecord":
            return (
              <VideoWithLinks {...(module as VideoWithLinksProps)} key={i} />
            );
          case "EmailCallToActionRecord":
            return (
              <EmailCallToAction
                {...(module as EmailCallToActionProps)}
                key={i}
              />
            );
          case "TestimonialAndShareRecord":
            return (
              <TestimonialAndShare
                {...(module as TestimonialAndShareProps)}
                key={i}
              />
            );
          case "SocialLinksBlockRecord":
            return <SocialLinks {...(module as SocialLinksProps)} key={i} />;
          case "AdvertBlockRecord":
            return <AdvertBlock {...(module as AdvertBlockProps)} key={i} />;
          case "CustomHtmlSectionRecord":
            return <HtmlSection {...module} key={i} />;
          case "CountdownRecord":
            return <CountdownSection {...(module as CountDownProps)} key={i} />;
          case "ImageRecord":
            return <SingleImage {...module as SingleImageProps} key={i} />
          default:
            return null;
        }
      })}
    </>
  );
};

export default ModuleContent;
