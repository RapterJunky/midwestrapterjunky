import Carousel from "./Carousel";
import EmailCallToAction from "./EmailCallToAction";
import UpcomingEvent from "./UpcomingEvent";
import UpcomingEvents from "./UpcomingEvents";

interface ModuleContentProps {
    data: { _modelApiKey: string; [key: string]: any; }[]
}

export default function ModuleContent(props: ModuleContentProps) { 
    return (
        <>{props.data.map((value,i)=>{
            switch (value._modelApiKey) {
                case "upcomingeventswithimage":
                    return <UpcomingEvents key={i} events={value?.events ?? []}/>;
                case "carousel":
                    return <Carousel key={i} images={value?.images ?? []}/>;
                case "upcomingevent":
                    return <UpcomingEvent key={i} textColor={value?.textColor} backgroundColor={value?.backgroundColor} data={value.event.description}/>;
                case  "email_call_to_action":
                    return <EmailCallToAction background_color={value?.backgroundColor} data={value?.callToActionMessage ?? {}} key={i} />
                default:
                    return null;
            }
        })}</>
    );
}