import { StructuredText } from "react-datocms";
import { markRules } from "@lib/StructuredTextRules";
import type { Color, StructuredContent } from "@type/page";

interface UpcomingEventProps {
  event: {
    title: string;
    description: StructuredContent 
  }
  backgroundColor?: Color;
  textColor?: Color;
}

export default function UpcomingEvent({ event, backgroundColor, textColor }: UpcomingEventProps) {
  return (
    <section className="my-2 flex flex-col items-center py-5 gap-3">
      <h1 className="text-center my-4 text-4xl font-bold border-b-2 w-1/2 sm:w-1/3 md:w-1/4 pb-2">{event.title}</h1>
      <article
        className="container mx-auto flex flex-col gap-3 text-center"
        style={{
          backgroundColor: backgroundColor?.hex,
          color: textColor?.hex,
        }}
      >
        <StructuredText customMarkRules={markRules} data={event.description} />
      </article>
    </section>
  );
}
