import {
  StructuredText,
  type StructuredTextGraphQlResponse,
} from "react-datocms/structured-text";
import { markRules } from "@lib/structuredTextRules";
import type { Color } from "@type/page";

export type UpcomingEventProps = {
  event: {
    title: string;
    description: StructuredTextGraphQlResponse;
  };
  backgroundColor?: Color;
  textColor?: Color;
};

export default function UpcomingEvent({
  event,
  backgroundColor,
  textColor,
}: UpcomingEventProps) {
  return (
    <section className="my-2 flex flex-col items-center gap-3 py-5">
      <div className="p-4">
        <h1 className="my-4 text-center text-xl font-bold sm:text-2xl md:text-4xl">
          {event.title}
        </h1>
        <hr />
        <article
          className="container mx-auto my-4 max-w-6xl text-center"
          style={{
            backgroundColor: backgroundColor?.hex,
            color: textColor?.hex,
          }}
        >
          <StructuredText
            customMarkRules={markRules}
            data={event.description}
          />
        </article>
      </div>
    </section>
  );
}
