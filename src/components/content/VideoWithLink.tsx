import { StructuredText } from 'react-datocms';
import { markRules } from '@lib/StructuredTextRules';
import type { Color } from '@lib/types';
import Button from "@components/Button";

interface VideoWithLinksProps {
    videoLink: string;
    isYoutubeVide: boolean;
    content: any;
    color: Color
}

export default function VideoWithLinks(props: VideoWithLinksProps){
    return (
        <section className="relative w-full flex h-[350px] md:h-[550px]">
            <div className="absolute top-0 flex flex-col gap-5 h-full items-start justify-center pl-32">
                <div style={{ color: props.color.hex }}>
                    <StructuredText customMarkRules={markRules} data={props.content}/>
                </div>
                <Button href="/calendar" link color={{ active: "active:bg-red-800", foucs: "foucs:bg-red-800", hover: "hover:bg-red-800", primary: "bg-red-700" }}>SEE ALL EVENTS</Button>
            </div>
            <div className="flex justify-center items-center overflow-hidden pointer-events-none w-full h-full">
                <iframe 
                    className="border-none w-[200%] h-[200%]" 
                    allowFullScreen 
                    allow="autoplay; encrypted-media;" 
                    title="Rare Ford F-150 Raptor Sighting at Northwest Motorsport" 
                    src="https://www.youtube.com/embed/wgOlJ8lvhwM?autoplay=1&loop=1&mute=1&playlist=wgOlJ8lvhwM&controls=0&fs=0" 
                    width="640" 
                    height="360"></iframe>
            </div>
        </section>
    );
}
