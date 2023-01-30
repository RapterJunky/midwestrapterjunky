import Button from '@components/Button';
import { formatTime } from '@lib/utils/timeFormat';
import Image from 'next/image';
import { ResponsiveImage } from '@lib/types';

interface UpcomingEventsProps {
    events: {
        linkTitle: string;
        eventLink: {
            dateFrom: string;
            dateTo: string;
            title: string;
            slug: string;
            id: string;
        }
        bgImage: ResponsiveImage<{ width: number; height: number; }>
    }[];
}

export default function UpcomingEvents(props: UpcomingEventsProps){
    return (
        <section className="flex flex-wrap w-full" role="feed">
            {props.events.map((event,i)=>(
                <div key={i} className="relative w-2/4 md:w-1/4 flex justify-center">
                    <div className="max-h-[608px] max-w-[608px] h-full w-full">
                        <Image className="pointer-events-none object-cover object-center" height={event.bgImage.responsiveImage.height} width={event.bgImage.responsiveImage.width} src={event.bgImage.responsiveImage.src} alt={event.bgImage.responsiveImage?.alt ?? "event preview"} blurDataURL={event.bgImage.blurUpThumb} sizes={event.bgImage.responsiveImage.sizes}/>
                    </div>
                    <div className="p-2 absolute top-0 h-full w-full flex flex-col justify-center items-center gap-5 bg-gray-900 bg-opacity md:opacity-0 hover:opacity-100 transition-opacity duration-150 ease-in-out">
                        <h2 className="text-white font-semibold text-xl text-center">{event.eventLink.title} {formatTime(event.eventLink.dateFrom,event.eventLink.dateTo)}</h2>
                        <Button href={`/events/${event.eventLink.slug}`} link>{event?.linkTitle ?? "VIEW EVENT"}</Button>
                    </div>
                </div>
            ))}
        </section>
    )
}
