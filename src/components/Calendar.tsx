import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { useState, useMemo } from 'react';
import Link from 'next/link';

interface CalenderProps {
    data: any[];
}

const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

/**
 * @author mithicher
 * @see https://tailwindcomponents.com/u/mithicher
 * @see https://tailwindcomponents.com/component/calendar-ui-with-tailwindcss-and-alpinejs
 * 
 */
export default function Calendar(props: CalenderProps){
    const today = useMemo(()=>{  
        const data = new Date();
        return  { date: data.getDate(), year: data.getFullYear(), month: data.getMonth() }
    },[]);
    const [current,setCurrent] = useState(today);

    const offsets = useMemo(()=>{
        const date = new Date(current.year,current.month+1,0);
        const daysInMonth = date.getDate();
        date.setDate(1);

        let offset = date.getDay();
        if(offset === 7) offset = 0;

        let offsetEnd = 7 - ( ( offset + daysInMonth ) % 7 );
        if(offsetEnd === 7) offsetEnd = 0;

        return { 
            start: offset, 
            end: offsetEnd , 
            days_in_month: daysInMonth,
            name: monthNames[date.getMonth()],
            days_last_month: new Date(current.year,(current.month === 0 ? 11 : current.month - 1 ) + 1,0).getDate()
        };
    },[current]);

    const vaildEvents = (value: { dateFrom: string; dateTo: string; }, day: number) => {
        const start = new Date(value.dateFrom);
        const end = new Date(value.dateTo);
        const date = new Date(current.year,current.month+1,day);
        return date >= start && date <= end;
    }
  
    const isToday = (day: number, offsetMonth = 0): boolean => {
        let month = current.month + offsetMonth;
        if(month > 11) month = 0; else if(month < 0) month = 11;
        return (today.date === day) && (today.month === month) && (today.year === (current.year));
    }
  
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
                            {Array.from({ length: offsets.start }, (_,i)=>offsets.days_last_month - i).reverse().map(day=>(
                                <div key={day} className="px-4 pt-2 border-r border-b relative w-1/7 h-30 bg-slate-100">
                                     <div className={`inline-flex w-6 h-6 items-center justify-center text-center leading-none rounded-full transition ease-in-out duration-100 text-gray-400 select-none ${ isToday(day,-1) ? "bg-gray-500 text-white" : "" }`}>
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
                                            <Link href={{ pathname: "/events/[id]", query: { id: event.slug } }} key={i} className="rounded-lg block px-2 py-1 mt-1 overflow-hidden border border-red-200 text-red-800 bg-red-100">
                                                <p className="text-sm truncate leading-tight">{event.title}</p>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ))}
                             {Array.from({ length: offsets.end }).map((_,i)=>(
                                <div key={i} className="border-r border-b px-4 pt-2 w-1/7 h-30 bg-slate-100">
                                    <div className={`inline-flex w-6 h-6 items-center justify-center text-center leading-none rounded-full transition ease-in-out duration-100 text-gray-400 select-none ${ isToday(i + 1,1) ? "bg-gray-500 text-white" : "" }`}>
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