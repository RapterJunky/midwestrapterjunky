import type { Color } from '@type/page';
import Countdown, { type CountdownRendererFn } from 'react-countdown';

interface Props {
    id: string;
    heading: string;
    bgColor: Color,
    event: {
        dateFrom: string;
        slug: string;
    }
    _modelApiKey: string;
}

const renderer: CountdownRendererFn = ({ formatted }) => {
    return (
        <div className='flex gap-4 flex-wrap justify-center items-center mb-4'>
            <div className='flex flex-col items-center w-28'>
                <h6 className="uppercase mb-2 text-white">Days</h6>
                <div className="text-7xl font-sans text-neutral-700 font-light bg-white rounded-sm p-2 shadow-lg w-full text-center overflow-hidden">
                    <div className="animate-in slide-in-from-bottom-6 duration-500">{formatted.days}</div>
                </div>
            </div>
            <div className='flex flex-col items-center w-28'>
                <h6 className="uppercase mb-2 text-white">Hours</h6>
                <div className="text-7xl font-sans text-neutral-700 font-light bg-white rounded-sm p-2 shadow-lg w-full text-center overflow-hidden">
                    <div className="animate-in slide-in-from-bottom-6 duration-500">{formatted.hours}</div>
                </div>
            </div>
            <div className='flex flex-col items-center w-28'>
                <h6 className="uppercase mb-2 text-white">Minutes</h6>
                <div className="text-7xl font-sans text-neutral-700 font-light bg-white rounded-sm p-2 shadow-lg w-full text-center overflow-hidden">
                    <div key={formatted.minutes} className='animate-in slide-in-from-bottom-6 duration-500'>{formatted.minutes}</div>
                </div>
            </div>
            <div className='flex flex-col items-center w-28'>
                <h6 className="uppercase mb-2 text-white">Seconds</h6>
                <div className="text-7xl font-sans text-neutral-700 font-light bg-white rounded-sm p-2 shadow-lg w-full text-center overflow-hidden">
                    <div key={formatted.seconds} className="animate-in slide-in-from-bottom-6">{formatted.seconds}</div>
                </div>
            </div>
        </div>
    );
}


const CountdownSection = ({ heading, event, bgColor }: Props) => {
 
    return (
        <section className="pt-10 pb-20 flex flex-col items-center justify-center animate-in fade-in ease-in duration-150" style={{ backgroundColor: bgColor.hex }}>
            <h2 className="my-10 font-inter text-4xl font-bold text-center md:leading-4 leading-9 tracking-tight text-white">
                {heading}
            </h2>
            <Countdown renderer={renderer} date={event.dateFrom}/>
        </section>
    );
}

export default CountdownSection;