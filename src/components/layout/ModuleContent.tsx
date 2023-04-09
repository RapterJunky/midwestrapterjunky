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

export default function ModuleContent(props: ModuleContentProps) {
  return (
    <>
      {props.data.map((value, i) => {
        switch (value._modelApiKey) {
          case "videowithlink": {
            const DynamicVideoWithLinks = dynamic(
              () => import("@components/content/VideoWithLink")
            );
            return (
              <DynamicVideoWithLinks
                key={i}
                {...(value as never as VideoWithLinksProps)}
              />
            );
          }
          case "image_gallery": {
            const DynamicImageGallery = dynamic(
              () => import("@components/content/ImageGallery")
            );
            return (
              <DynamicImageGallery
                key={i}
                {...(value as never as ImageGalleryProps)}
              />
            );
          }
          case "featuredshop": {
            const DynamicFeaturedShopItems = dynamic(
              () => import("@components/content/FeaturedShopItems")
            );
            return (
              <DynamicFeaturedShopItems
                key={i}
                items={
                  (value?.items ?? []) as never as FeatureShopItems["items"]
                }
              />
            );
          }
          case "upcomingeventswithimage": {
            const DynamicUpcomingEvents = dynamic(
              () => import("@components/content/UpcomingEvents")
            );
            return (
              <DynamicUpcomingEvents
                key={i}
                events={(value?.events ?? []) as UpcomingEventsProps["events"]}
              />
            );
          }
          case "carousel": {
            const DynamicCarousel = dynamic(
              () => import("@components/content/Carousel"),
              {
                loading: () => <div className="h-screen"></div>,
              }
            );
            return (
              <DynamicCarousel
                key={i}
                images={(value?.images ?? []) as CarouselProps["images"]}
              />
            );
          }
          case "upcomingevent": {
            const DynamicUpcomingEvent = dynamic(
              () => import("@components/content/UpcomingEvent")
            );
            return (
              <DynamicUpcomingEvent
                key={i}
                {...(value as never as UpcomingEventProps)}
              />
            );
          }
          case "email_call_to_action": {
            const DynamicEmailCallToAction = dynamic(
              () => import("@components/content/EmailCallToAction")
            );
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
          case "testimonial_and_share": {
            const DynamicTestimonialAndShare = dynamic(
              () => import("@components/content/TestimonialAndShare")
            );
            return (
              <DynamicTestimonialAndShare
                {...(value as never as TestimonialAndShareProps)}
                key={i}
              />
            );
          }
          case "social_links_block": {
            const DynamicSocialLinks = dynamic(
              () => import("@components/content/SocialLinks")
            );
            return (
              <DynamicSocialLinks
                key={i}
                {...(value as never as SocialLinksProps)}
              />
            );
          }
          case "advert_block": {
            const DynamicAdvertBlock = dynamic(
              () => import("@components/content/AdvertBlock")
            );
            return (
              <DynamicAdvertBlock
                key={i}
                {...(value as never as AdvertBlockProps)}
              />
            );
          }
          case "custom_html_section": {
            const DynamicHtmlSection = dynamic(
              () => import("@components/content/HtmlSection")
            );
            return (
              <DynamicHtmlSection
                key={i}
                {...(value as never as { content: string })}
              />
            );
          }
          case "countdown": {
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
