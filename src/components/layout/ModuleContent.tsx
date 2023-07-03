import dynamic from "next/dynamic";
import type { ModulerContent } from "@type/page";
import type { FeatureShopItems } from "@components/content/FeaturedShopItems";
import type { UpcomingEventsProps } from "@components/content/UpcomingEvents";
import type { CarouselProps } from "@components/content/Carousel";
import type { EmailCallToActionProps } from "@components/content/EmailCallToAction";
import type { TestimonialAndShareProps } from "@components/content/TestimonialAndShare";
import type { SocialLinksProps } from "@components/content/SocialLinks";
import type { AdvertBlockProps } from "@components/content/AdvertBlock";
import type { CountDownProps } from "@components/content/Countdown";
import type { VideoWithLinksProps } from "@components/content/VideoWithLink";
import type { ImageGalleryProps } from "@components/content/ImageGallery";
import type { UpcomingEventProps } from "@components/content/UpcomingEvent";

interface ModuleContentProps {
  data: ModulerContent[];
}

const DynamicVideoWithLinks = dynamic(
  () => import("@components/content/VideoWithLink")
);
const DynamicImageGallery = dynamic(
  () => import("@components/content/ImageGallery")
);
const DynamicFeaturedShopItems = dynamic(
  () => import("@components/content/FeaturedShopItems")
);
const DynamicUpcomingEvents = dynamic(
  () => import("@components/content/UpcomingEvents")
);
const DynamicCarousel = dynamic(() => import("@components/content/Carousel"), {
  loading: () => <div className="h-screen"></div>,
});
const DynamicUpcomingEvent = dynamic(
  () => import("@components/content/UpcomingEvent")
);
const DynamicEmailCallToAction = dynamic(
  () => import("@components/content/EmailCallToAction")
);
const DynamicTestimonialAndShare = dynamic(
  () => import("@components/content/TestimonialAndShare")
);
const DynamicSocialLinks = dynamic(
  () => import("@components/content/SocialLinks")
);
const DynamicAdvertBlock = dynamic(
  () => import("@components/content/AdvertBlock")
);
const DynamicHtmlSection = dynamic(
  () => import("@components/content/HtmlSection")
);
const DynamicCountDown = dynamic(
  () => import("@components/content/Countdown"),
  {
    loading: () => (
      <div className="flex h-80 justify-center">
        <span className="animate-pulse">Loading...</span>
      </div>
    ),
    ssr: false,
  }
);

export default function ModuleContent(props: ModuleContentProps) {
  return (
    <>
      {props.data.map((value, i) => {
        switch (value.__typename) {
          case "VideowithlinkRecord": {
            return (
              <DynamicVideoWithLinks
                key={i}
                {...(value as never as VideoWithLinksProps)}
              />
            );
          }
          case "ImageGalleryRecord": {
            return (
              <DynamicImageGallery
                key={i}
                {...(value as never as ImageGalleryProps)}
              />
            );
          }
          case "FeaturedshopRecord": {
            return (
              <DynamicFeaturedShopItems
                key={i}
                items={
                  (value?.items ?? []) as never as FeatureShopItems["items"]
                }
              />
            );
          }
          case "UpcomingeventswithimageRecord": {
            return (
              <DynamicUpcomingEvents
                key={i}
                events={(value?.events ?? []) as UpcomingEventsProps["events"]}
              />
            );
          }
          case "CarouselRecord": {
            return (
              <DynamicCarousel
                key={i}
                images={(value?.images ?? []) as CarouselProps["images"]}
              />
            );
          }
          case "UpcomingeventRecord": {
            return (
              <DynamicUpcomingEvent
                key={i}
                {...(value as never as UpcomingEventProps)}
              />
            );
          }
          case "EmailCallToActionRecord": {
            return (
              <DynamicEmailCallToAction
                background_color={
                  value?.backgroundColor as EmailCallToActionProps["background_color"]
                }
                data={
                  (value?.callToActionMessage ??
                    {}) as EmailCallToActionProps["data"]
                }
                key={i}
              />
            );
          }
          case "TestimonialAndShareRecord": {
            return (
              <DynamicTestimonialAndShare
                {...(value as never as TestimonialAndShareProps)}
                key={i}
              />
            );
          }
          case "SocialLinksBlockRecord": {
            return (
              <DynamicSocialLinks
                key={i}
                {...(value as never as SocialLinksProps)}
              />
            );
          }
          case "AdvertBlockRecord": {
            return (
              <DynamicAdvertBlock
                key={i}
                {...(value as never as AdvertBlockProps)}
              />
            );
          }
          case "CustomHtmlSectionRecord": {
            return (
              <DynamicHtmlSection
                key={i}
                {...(value as never as { content: string })}
              />
            );
          }
          case "CountdownRecord": {
            return (
              <DynamicCountDown
                key={i}
                {...(value as never as CountDownProps)}
              />
            );
          }
          default:
            return null;
        }
      })}
    </>
  );
}
