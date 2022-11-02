import Link from 'next/link';
import Button from './Button';
import { formatTime } from '../lib/timeFormat';

interface UpcomingEventsProps {
    events: {
        eventLink: {
            dateFrom: string;
            dateTo: string;
            title: string;
            id: string;
        }
        bgImage: {
            url: string;
            alt: string;
        }
    }[];
}

export default function UpcomingEvents(props: UpcomingEventsProps){
    return (
        <section className="flex flex-wrap w-full">
            {props.events.map((event,i)=>(
                <div key={i} className="relative w-2/4 md:w-1/4">
                    <div className="h-full w-full max-h-[608px] max-w-[608px]">
                        <img className="object-contain object-top pointer-events-none h-full w-full" src={event.bgImage.url} alt={event.bgImage.alt}/>
                    </div>
                    <div className="p-2 absolute top-0 h-full w-full flex flex-col justify-center items-center gap-5 bg-gray-900 bg-opacity md:opacity-0 hover:opacity-100 transition-opacity duration-150 ease-in-out">
                        <h2 className="text-white font-semibold text-xl text-center">{event.eventLink.title} {formatTime(event.eventLink.dateFrom,event.eventLink.dateTo)}</h2>
                        <Button href={`/events/${event.eventLink.id}`} link>BUY A TICKET</Button>
                    </div>
                </div>
            ))}
        </section>
    )
}