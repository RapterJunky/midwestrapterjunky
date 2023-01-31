import type { ModulerContent } from "../lib/types";
import AdvertBlock from "./content/AdvertBlock";
import Carousel from "./content/Carousel";
import EmailCallToAction from "./content/EmailCallToAction";
import FeaturedShopItems from "./content/FeaturedShopItems";
import ImageGallery from "./content/ImageGallery";
import SocialLinks from "./content/SocialLinks";
import TestimonialAndShare from "./content/TestimonialAndShare";
import UpcomingEvent from "./content/UpcomingEvent";
import UpcomingEvents from "./content/UpcomingEvents";
import VideoWithLinks from "./content/VideoWithLink";
import HtmlSection from "./content/HtmlSection";

interface ModuleContentProps {
  data: ModulerContent[];
}

export default function ModuleContent(props: ModuleContentProps) {
  return (
    <>
      {props.data.map((value, i) => {
        switch (value._modelApiKey) {
          case "videowithlink":
            return <VideoWithLinks key={i} {...(value as any)} />;
          case "image_gallery":
            return <ImageGallery key={i} {...(value as any)} />;
          case "featuredshop":
            return <FeaturedShopItems key={i} items={value?.items ?? []} />;
          case "upcomingeventswithimage":
            return <UpcomingEvents key={i} events={value?.events ?? []} />;
          case "carousel":
            return <Carousel key={i} images={value?.images ?? []} />;
          case "upcomingevent":
            return (
              <UpcomingEvent
                key={i}
                textColor={value?.textColor}
                backgroundColor={value?.backgroundColor}
                data={value.event.description}
              />
            );
          case "email_call_to_action":
            return (
              <EmailCallToAction
                background_color={value?.backgroundColor}
                data={value?.callToActionMessage ?? {}}
                key={i}
              />
            );
          case "testimonial_and_share":
            return <TestimonialAndShare {...(value as any)} key={i} />;
          case "social_links_block":
            return <SocialLinks key={i} {...(value as any)} />;
          case "advert_block":
            return <AdvertBlock key={i} {...(value as any)} />;
          case "custom_html_section":
            return <HtmlSection key={i} {...(value as any)} />;
          default:
            return null;
        }
      })}
    </>
  );
}
