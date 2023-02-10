import { StructuredText } from "react-datocms";
import { markRules } from "@lib/StructuredTextRules";
import Button from "@components/Button";

import type { Color } from "@type/page";

interface VideoWithLinksProps {
  videoLink: string;
  isYoutubeVideo: boolean;
  content: any;
  color: Color;
  youtubeid: string;
}

export default function VideoWithLinks(props: VideoWithLinksProps) {
  return (
    <section className="relative flex h-[350px] w-full md:h-[550px]">
      <div className="absolute top-0 z-10 flex h-full flex-col items-start justify-center gap-5 bg-gray-700 bg-opacity-80 pl-8 sm:bg-transparent sm:pl-10 md:pl-32">
        <div style={{ color: props.color.hex }}>
          <StructuredText customMarkRules={markRules} data={props.content} />
        </div>
        <Button
          href="/calendar"
          link
          color={{
            active: "active:bg-red-800",
            foucs: "foucs:bg-red-800",
            hover: "hover:bg-red-800",
            primary: "bg-red-700",
          }}
        >
          SEE ALL EVENTS
        </Button>
      </div>
      <div className="pointer-events-none flex h-full w-full items-center justify-center overflow-hidden">
        {/**https://developer.chrome.com/docs/lighthouse/performance/third-party-facades/ */}
        {props.isYoutubeVideo ? (
          <iframe
            className="h-[200%] w-[200%] border-none"
            allowFullScreen
            allow="autoplay; encrypted-media;"
            title="Rare Ford F-150 Raptor Sighting at Northwest Motorsport"
            src={`https://www.youtube-nocookie.com/embed/${props.youtubeid}?autoplay=1&loop=1&mute=1&playlist=${props.youtubeid}&controls=0&fs=0`}
            width="640"
            height="360"
          ></iframe>
        ) : (
          <video
            className="h-[200%] w-[200%] border-none"
            width="640"
            height="360"
            muted
            autoPlay
            src={props.videoLink}
          />
        )}
      </div>
    </section>
  );
} //wgOlJ8lvhwM
