import Carousel from "./content/Carousel";
import EmailCallToAction from "./content/EmailCallToAction";
import FeaturedShopItems from "./content/FeaturedShopItems";
import TestimonialAndShare from "./content/TestimonialAndShare";
import UpcomingEvent from "./content/UpcomingEvent";
import UpcomingEvents from "./content/UpcomingEvents";

interface ModuleContentProps {
    data: { _modelApiKey: string; [key: string]: any; }[]
}

export default function ModuleContent(props: ModuleContentProps) { 
    return (
        <>{props.data.map((value,i)=>{
            switch (value._modelApiKey) {
                case "featuredshop":
                    return <FeaturedShopItems key={i} items={value?.items ?? []} />
                case "upcomingeventswithimage":
                    return <UpcomingEvents key={i} events={value?.events ?? []}/>;
                case "carousel":
                    return <Carousel key={i} images={value?.images ?? []}/>;
                case "upcomingevent":
                    return <UpcomingEvent key={i} textColor={value?.textColor} backgroundColor={value?.backgroundColor} data={value.event.description}/>;
                case  "email_call_to_action":
                    return <EmailCallToAction background_color={value?.backgroundColor} data={value?.callToActionMessage ?? {}} key={i} />
                case "testimonial_and_share":
                    return <TestimonialAndShare {...value as any} key={i} />
                default:
                    return null;
            }
        })}</>
    );
}