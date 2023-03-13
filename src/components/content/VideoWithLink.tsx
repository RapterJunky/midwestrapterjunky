import { StructuredText } from "react-datocms/structured-text";
import { markRules } from "@lib/structuredTextRules";
import Button from "@components/Button";

import type { Color } from "types/page";
import YoutubeFrame from "@components/YoutubeFrame";

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
        {props.isYoutubeVideo ? (
          <YoutubeFrame youtubeId={props.youtubeid} />
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
