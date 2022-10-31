import Carousel from "./Carousel";
import EmailCallToAction from "./EmailCallToAction";

interface ModuleContentProps {
    data: { id: string; [key: string]: any; }[]
}

export default function ModuleContent(props: ModuleContentProps) { 
    return (
        <>{props.data.map((value,i)=>{
            switch (value.id) {
                // carousel
                case "55936981":
                    return <Carousel key={i} images={value?.images ?? []}/>;
                // UpcomingEvent
                case "55936989":
                    return null;
                // Email Call to Action
                case "55987156":
                    return <EmailCallToAction background_color={value?.backgroundColor} data={value?.callToActionMessage ?? {}} key={i} />
                default:
                    return null;
            }
        })}</>
    );
}