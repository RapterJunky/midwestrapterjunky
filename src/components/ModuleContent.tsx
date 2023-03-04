import dynamic from "next/dynamic";
import type { ModulerContent } from "@type/page";

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
            return <DynamicVideoWithLinks key={i} {...(value as any)} />;
          }
          case "image_gallery": {
            const DynamicImageGallery = dynamic(
              () => import("@components/content/ImageGallery")
            );
            return <DynamicImageGallery key={i} {...(value as any)} />;
          }
          case "featuredshop": {
            const DynamicFeaturedShopItems = dynamic(
              () => import("@components/content/FeaturedShopItems")
            );
            return (
              <DynamicFeaturedShopItems key={i} items={value?.items ?? []} />
            );
          }
          case "upcomingeventswithimage": {
            const DynamicUpcomingEvents = dynamic(
              () => import("@components/content/UpcomingEvents")
            );
            return (
              <DynamicUpcomingEvents key={i} events={value?.events ?? []} />
            );
          }
          case "carousel": {
            const DynamicCarousel = dynamic(
              () => import("@components/content/Carousel"),
              {
                loading: () => <div className="h-screen"></div>,
              }
            );
            return <DynamicCarousel key={i} images={value?.images ?? []} />;
          }
          case "upcomingevent": {
            const DynamicUpcomingEvent = dynamic(
              () => import("@components/content/UpcomingEvent")
            );
            return <DynamicUpcomingEvent key={i} {...(value as any)} />;
          }
          case "email_call_to_action": {
            const DynamicEmailCallToAction = dynamic(
              () => import("@components/content/EmailCallToAction")
            );
            return (
              <DynamicEmailCallToAction
                background_color={value?.backgroundColor}
                data={value?.callToActionMessage ?? {}}
                key={i}
              />
            );
          }
          case "testimonial_and_share": {
            const DynamicTestimonialAndShare = dynamic(
              () => import("@components/content/TestimonialAndShare")
            );
            return <DynamicTestimonialAndShare {...(value as any)} key={i} />;
          }
          case "social_links_block": {
            const DynamicSocialLinks = dynamic(
              () => import("@components/content/SocialLinks")
            );
            return <DynamicSocialLinks key={i} {...(value as any)} />;
          }
          case "advert_block": {
            const DynamicAdvertBlock = dynamic(
              () => import("@components/content/AdvertBlock")
            );
            return <DynamicAdvertBlock key={i} {...(value as any)} />;
          }
          case "custom_html_section": {
            const DynamicHtmlSection = dynamic(
              () => import("@components/content/HtmlSection")
            );
            return <DynamicHtmlSection key={i} {...value} />;
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
            return <DynamicCountDown key={i} {...(value as any)} />;
          }
          default:
            return null;
        }
      })}
    </>
  );
}
