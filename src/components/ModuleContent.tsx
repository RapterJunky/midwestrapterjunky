import dynamic from 'next/dynamic'
import type { ModulerContent } from "@type/page";
import AdvertBlock from "@components/content/AdvertBlock";
import Carousel from "@components/content/Carousel";
import EmailCallToAction from "@components/content/EmailCallToAction";
import FeaturedShopItems from "@components/content/FeaturedShopItems";
import ImageGallery from "@components/content/ImageGallery";
import SocialLinks from "@components/content/SocialLinks";
import TestimonialAndShare from "@components/content/TestimonialAndShare";
import UpcomingEvent from "@components/content/UpcomingEvent";
import UpcomingEvents from "@components/content/UpcomingEvents";
import VideoWithLinks from "@components/content/VideoWithLink";
import HtmlSection from "@components/content/HtmlSection";

interface ModuleContentProps {
  data: ModulerContent[];
}

const DynamicCountDown = dynamic(() => import('@components/content/Countdown'), {
  loading: () => (<div className="h-80 flex justify-center"><span className='animate-pulse'>Loading...</span></div>),
  ssr: false
})

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
            return <HtmlSection key={i} {...value} />;
          case "countdown": 
            return <DynamicCountDown key={i} {...(value as any)}/>
          default:
            return null;
        }
      })}
    </>
  );
}
