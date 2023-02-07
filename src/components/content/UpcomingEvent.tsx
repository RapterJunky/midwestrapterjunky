import { StructuredText } from "react-datocms";
import { markRules } from "@lib/StructuredTextRules";
import type { Color, StructuredContent } from "@type/page";

interface UpcomingEventProps {
  event: {
    title: string;
    description: StructuredContent;
  };
  backgroundColor?: Color;
  textColor?: Color;
}

export default function UpcomingEvent({
  event,
  backgroundColor,
  textColor,
}: UpcomingEventProps) {
  return (
    <section className="my-2 flex flex-col items-center gap-3 py-5">
      <h1 className="my-4 w-1/2 border-b-2 pb-2 text-center text-4xl font-bold sm:w-1/3 md:w-1/4">
        {event.title}
      </h1>
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
