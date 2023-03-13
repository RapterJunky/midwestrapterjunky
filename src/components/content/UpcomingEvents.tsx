import Image from "next/image";
import Button from "@components/Button";
import { formatTime } from "@utils/timeFormat";
import type { ResponsiveImage } from "types/page";

interface UpcomingEventsProps {
  events: {
    linkTitle: string;
    eventLink: {
      dateFrom: string;
      dateTo: string;
      title: string;
      slug: string;
      id: string;
    };
    bgImage: ResponsiveImage<{ width: number; height: number }>;
  }[];
}

export default function UpcomingEvents(props: UpcomingEventsProps) {
  return (
    <section className="flex w-full flex-wrap">
      {props.events.map((event, i) => (
        <div key={i} className="relative flex w-2/4 justify-center md:w-1/4">
          <div className="flex h-full max-h-[608px] w-full max-w-[608px] justify-center">
            <Image
              className="pointer-events-none object-cover object-center"
              height={event.bgImage.responsiveImage.height}
              width={event.bgImage.responsiveImage.width}
              src={event.bgImage.responsiveImage.src}
              alt={event.bgImage.responsiveImage?.alt ?? "event preview"}
              blurDataURL={event.bgImage.blurUpThumb}
              sizes={event.bgImage.responsiveImage.sizes}
            />
          </div>
          <div className="absolute top-0 flex h-full w-full flex-col items-center justify-center gap-5 bg-gray-900 bg-opacity-50 p-2 transition-opacity duration-150 ease-in-out hover:opacity-100 md:opacity-0">
            <h2 className="text-center text-xl font-semibold text-white">
              {event.eventLink.title}{" "}
              {formatTime(event.eventLink.dateFrom, event.eventLink.dateTo)}
            </h2>
            <Button href={`/events/${event.eventLink.slug}`} link>
              {event?.linkTitle ?? "VIEW EVENT"}
            </Button>
          </div>
        </div>
      ))}
    </section>
  );
}
