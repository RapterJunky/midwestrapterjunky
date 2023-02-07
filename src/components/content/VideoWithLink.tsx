import { StructuredText } from "react-datocms";
import { markRules } from "@lib/StructuredTextRules";
import Button from "@components/Button";

import type { Color } from "@type/page";

interface VideoWithLinksProps {
  videoLink: string;
  isYoutubeVide: boolean;
  content: any;
  color: Color;
}

export default function VideoWithLinks(props: VideoWithLinksProps) {
  return (
    <section className="relative flex h-[350px] w-full md:h-[550px]">
      <div className="absolute top-0 flex h-full flex-col items-start justify-center gap-5 pl-32">
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
        <iframe
          className="h-[200%] w-[200%] border-none"
          allowFullScreen
          allow="autoplay; encrypted-media;"
          title="Rare Ford F-150 Raptor Sighting at Northwest Motorsport"
          src="https://www.youtube-nocookie.com/embed/wgOlJ8lvhwM?autoplay=1&loop=1&mute=1&playlist=wgOlJ8lvhwM&controls=0&fs=0"
          width="640"
          height="360"
        ></iframe>
      </div>
    </section>
  );
}
