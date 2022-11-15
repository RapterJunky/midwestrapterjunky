import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { useState, useEffect } from 'react';
import moment from 'moment';
import Link from 'next/link';

/**
 * @author mithicher
 * @see https://tailwindcomponents.com/u/mithicher
 * @see https://tailwindcomponents.com/component/calendar-ui-with-tailwindcss-and-alpinejs
 * 
 */

interface CalenderProps {
    data: any[];
}

export default function Calendar(props: CalenderProps){
    const [today,setToday] = useState({ date: 1, year: 2022, month: 10 });
    const [current,setCurrent] = useState({ date: 0, year: 2022, month: 10 });
    const [offsets,setOffsets] = useState({ start: 2, end: 3, days_in_month: 30, days_last_month: 31, name: 'November' });

    const vaildEvents = (value: any, day: number) => {
        const start = moment(value.dateFrom).unix();
        const end = moment(value.dateTo).add({ days: 1 }).unix();
        const date = moment().set({ date: day, month: current.month, year: current.year }).unix();
        return date >= start && date < end;
    }
  
    const isToday = (day: number): boolean => today.date === day && today.month === current.month && today.year === current.year;
    
    const nextMouth = () => {
        setCurrent(data=>{

            let year = data.year;
            let nextMouth = data.month + 1;
            if(nextMouth > 11) {
                nextMouth = 0;
                year++;
            }

            return {...data, month: nextMouth, year };
        });

    }
    const prevMouth = () => {
        setCurrent(data=>{

            let year = data.year;
            let nextMouth = data.month - 1;
            if(nextMouth < 0) {
                nextMouth = 11;
                year--;
            }

            return {...data, month: nextMouth, year };
        });
    }

    useEffect(()=>{
        const data = moment();
        const orgin = { date: data.date(), year: data.year(), month: data.month() };
        setToday(orgin);
        setCurrent(orgin);
    },[]);

    useEffect(()=>{
        const data = moment().set({ year: current.year, month: current.month });

        const dim = data.daysInMonth();
        let offset = data.day() + 1;

        if(offset === 7) offset = 0;
        
        let offsetEnd = 7 - ( ( offset + dim ) % 7 );
        if(offsetEnd === 7) offsetEnd = 0;

        setOffsets({ 
            start: offset, 
            end: offsetEnd , 
            days_in_month: dim,
            name: data.format("MMMM"),
            days_last_month: data.month( current.month === 0 ? 11 : current.month - 1 ).daysInMonth() - offset
        });

    },[current]);


    return (
        <div className="antialiased sans-serif bg-gray-100 flex flex-col">
            <div className="container mx-auto px-4 py-2 md:py-24">

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    
                    <div className="flex items-center justify-between py-2 px-6">
                        <div>
                            <span className="text-lg font-bold text-gray-800">{offsets.name}</span>
                            <span className="ml-1 text-lg text-gray-600 font-normal">{current.year}</span>
                        </div>
                        <div className="border rounded-lg px-1 pt-0.5" >
                            <button onClick={prevMouth} type="button" className="leading-none rounded-lg transition ease-in-out duration-100 inline-flex cursor-pointer hover:bg-gray-200 p-1 items-center">
                                <HiChevronLeft className="h-6 w-6 text-gray-500 inline-flex leading-none"/>    
                            </button> 
                            <div className="border-r inline-flex h-6"></div>
                            <button onClick={nextMouth} type="button" className="leading-none rounded-lg transition ease-in-out duration-100 inline-flex items-center cursor-pointer hover:bg-gray-200 p-1" >
                                <HiChevronRight className="h-6 w-6 text-gray-500 inline-flex leading-none"/>
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-wrap">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day,i)=>(
                            <div key={i} className="px-2 py-2 w-1/7">
                                <div className="text-gray-600 text-sm uppercase tracking-wide font-bold text-center">
                                    {day}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="-mx-1 -mb-1">
            
                        <div className="flex flex-wrap border-t border-l">
                            {Array.from({ length: offsets.start }, (_,i)=> offsets.days_last_month + (i + 1) ).map(day=>(
                                <div key={day} className="px-4 pt-2 border-r border-b relative w-1/7 h-30 bg-slate-100">
                                     <div className={`inline-flex w-6 h-6 items-center justify-center text-center leading-none rounded-full transition ease-in-out duration-100 text-gray-400 select-none ${ isToday(day) ? "bg-gray-500 text-white" : "" }`}>
                                        { day }
                                    </div>
                                </div>
                            ))}
                            {Array.from({ length: offsets.days_in_month },(_,k)=>k+1).map((day,i)=>(
                                <div key={i} className="px-4 pt-2 border-r border-b relative w-1/7 h-30">
                                    <div className={`inline-flex w-6 h-6 items-center justify-center cursor-pointer text-center leading-none rounded-full transition ease-in-out duration-100 select-none ${ isToday(day) ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-blue-200" }`}>
                                        {day}
                                    </div>
                                    <div style={{height: "80px"}} className="overflow-y-auto mt-1">
                                        {props.data.filter((value)=>vaildEvents(value,day)).map((event,i)=>(
                                            <Link href={{ pathname: "/events/[id]", query: { id: event.id } }} key={i} className="block px-2 py-1 rounded-lg mt-1 overflow-hidden border border-red-200 text-red-800 bg-red-100">
                                                <p className="text-sm truncate leading-tight">{event.title}</p>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ))}
                             {Array.from({ length: offsets.end }).map((_,i)=>(
                                <div key={i} className="border-r border-b px-4 pt-2 w-1/7 h-30 bg-slate-100">
                                    <div className={`inline-flex w-6 h-6 items-center justify-center text-center leading-none rounded-full transition ease-in-out duration-100 text-gray-400 select-none ${ isToday(i + 1) ? "bg-gray-500 text-white" : "" }`}>
                                        { i + 1 }
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>

                </div>


            </div>
        </div>
    );
}