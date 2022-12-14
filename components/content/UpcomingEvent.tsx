import { StructuredText } from "react-datocms";
import { markRules } from '../../lib/StructuredTextRules';
import type { Color, StructuredContent } from "../../lib/types";

interface UpcomingEventProps {
    data: StructuredContent;
    backgroundColor?:  Color;
    textColor?: Color;
}

export default function UpcomingEvent(props: UpcomingEventProps){
    return (
        <div className="flex justify-center py-5 my-2">
            <article className="container text-center flex flex-col gap-3 mx-auto" style={{ backgroundColor: props?.backgroundColor?.hex, color: props?.textColor?.hex }}>
                <StructuredText customMarkRules={markRules} data={props.data}/>
            </article>
        </div>
    );
}