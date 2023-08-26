import {
  StructuredText,
  type StructuredTextGraphQlResponse,
} from "react-datocms/structured-text";
import Link from "next/link";
import { markRules } from "@lib/structuredTextRules";
import { Button } from "@/components/ui/button";

import type { Color, ModulerContent } from "@type/page";
import YoutubeFrame from "@components/YoutubeFrame";

export interface VideoWithLinksProps extends ModulerContent {
  videoLink: string;
  isYoutubeVideo: boolean;
  content: StructuredTextGraphQlResponse;
  color: Color;
  youtubeid: string;
};

export default function VideoWithLinks(props: VideoWithLinksProps) {
  return (
    <section className="relative flex h-[350px] w-full md:h-[550px]">
      <div className="absolute top-0 z-10 flex h-full flex-col items-start justify-center gap-5 bg-gray-700 bg-opacity-80 pl-8 sm:bg-transparent sm:pl-10 md:pl-32">
        <div style={{ color: props.color.hex }}>
          <StructuredText customMarkRules={markRules} data={props.content} />
        </div>
        <Button asChild>
          <Link href="/calendar">
            SEE ALL EVENTS
          </Link>
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
