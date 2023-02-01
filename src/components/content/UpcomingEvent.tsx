import { StructuredText } from "react-datocms";
import { markRules } from "@lib/StructuredTextRules";
import type { Color, StructuredContent } from "@type/page";

interface UpcomingEventProps {
  data: StructuredContent;
  backgroundColor?: Color;
  textColor?: Color;
}

export default function UpcomingEvent(props: UpcomingEventProps) {
  return (
    <div className="my-2 flex justify-center py-5">
      <article
        className="container mx-auto flex flex-col gap-3 text-center"
        style={{
          backgroundColor: props?.backgroundColor?.hex,
          color: props?.textColor?.hex,
        }}
      >
        <StructuredText customMarkRules={markRules} data={props.data} />
      </article>
    </div>
  );
}
