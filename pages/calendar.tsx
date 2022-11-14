import type { GetStaticPropsContext, GetStaticPropsResult } from "next";
import { renderMetaTags, type SeoOrFaviconTag } from 'react-datocms';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { Menu } from '@headlessui/react';

import Footer from "../components/Footer";
import Navbar, { NavProps } from "../components/Navbar";
import { DATOCMS_Fetch } from "../lib/gql";
import Query from '../gql/queries/calendar';
import Head from "next/head";

/**
 * @author mithicher
 * @see https://tailwindcomponents.com/u/mithicher
 * @see https://tailwindcomponents.com/component/calendar-ui-with-tailwindcss-and-alpinejs
 * 
 */

interface CalendarProps extends NavProps {
    _site: {
        faviconMetaTags: SeoOrFaviconTag[];
    };
    allEvents: any[];
}

export const getStaticProps = async (ctx: GetStaticPropsContext): Promise<GetStaticPropsResult<CalendarProps>> => {

    const data = await DATOCMS_Fetch<CalendarProps>(Query,{ 
        preview: ctx.preview, 
        variables: {
            first: 20
        } 
    });

    return {
        props: data
    }
}

export default function Calendar(props: CalendarProps){
    return (
        <div className="flex flex-col">
            <Head>
                {renderMetaTags([
                    ...props._site.faviconMetaTags
                ])}
            </Head>
            <header>
                <Navbar {...props.navbar} mode="none"/>
            </header>
            <main className="antialiased sans-serif bg-gray-100 flex flex-col h-full">
                <div className="px-4 py-2 h-[200%] flex-grow">
                    <div className="bg-white rounded-lg shadow overflow-hidden h-full">

                        <header className="flex items-center justify-between py-2 px-6">
                            <div>
                                <span x-text="MONTH_NAMES[month]" className="text-lg font-bold text-gray-800">November</span>
                                <span x-text="year" className="ml-1 text-lg text-gray-600 font-normal">2022</span>
                            </div>
                            <div className="border rounded-lg px-1" style={{paddingTop: "2px"}}>
                                <button type="button" className="leading-none rounded-lg transition ease-in-out duration-100 inline-flex cursor-pointer hover:bg-gray-200 p-1 items-center" 
                                        x-class="{'cursor-not-allowed opacity-25': month == 0 }"
                                        x-disabled="month == 0 ? true : false"
                                        x-click="month--; getNoOfDays()">
                                    <HiChevronLeft className="h-6 w-6 text-gray-500 inline-flex leading-none"/>
                                </button>
                                <div className="border-r inline-flex h-6"></div>		
                                <button type="button" className="leading-none rounded-lg transition ease-in-out duration-100 inline-flex items-center cursor-pointer hover:bg-gray-200 p-1" 
                                        x-class="{'cursor-not-allowed opacity-25': month == 11 }"
                                        x-disabled="month == 11 ? true : false"
                                        x-click="month++; getNoOfDays()">
                                    <HiChevronRight className="h-6 w-6 text-gray-500 inline-flex leading-none"/>								  
                                </button>
                            </div>
                        </header>

                        <div className="flex flex-wrap">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((value,i)=>(
                                <div className="px-2 py-2 w-1/7" key={i}>
                                        <div className="text-gray-600 text-sm uppercase tracking-wide font-bold text-center">{value}</div>
                                </div>
                             ))}
                        </div>

                        <div className="-mx-1 -mb-1 h-full">

                            <div className="flex flex-wrap border-t border-l h-full">
                                {[0,1].map((_,i)=>(
                                    <div key={i} className="text-center border-r border-b px-4 pt-2 w-1/7 flex-grow h-1/5 bg-slate-100"></div>
                                ))}

                                {Array.from({ length: 30 },(_,k)=>k).map((value,i)=>(
                                    <div key={i} className="px-4 pt-2 border-r border-b relative w-1/7 flex-grow h-1/5 cursor-pointer">
                                        <div className="inline-flex w-6 h-6 items-center justify-center cursor-pointer text-center leading-none rounded-full transition ease-in-out duration-100"
                                                x-click="showEventModal(date)"
                                                x-text="date"
                                                x-class="{'bg-blue-500 text-white': isToday(date) == true, 'text-gray-700 hover:bg-blue-200': isToday(date) == false }"	
                                        >{value+1}</div>
                                        <div style={{height: "80px"}} className="overflow-y-auto mt-1">
                                            {([] as { title: string }[]).map((event,i)=>(
                                                <div key={i} className="px-2 py-1 rounded-lg mt-1 overflow-hidden border">
                                                    <p className="text-sm truncate leading-tight">{event?.title ?? "Event"}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                {[0,1,2].map((_,i)=>(
                                    <div key={i} className="text-center border-r border-b px-4 pt-2 w-1/7 flex-grow h-1/5 bg-slate-100"></div>
                                ))}
                            </div>

                        </div>
                    </div>
                </div>
            </main>
            <Footer/>
        </div>
    );
}

/*
<div>
<div class="antialiased sans-serif bg-gray-100 h-screen">
	<div x-data="app()" x-init="[initDate(), getNoOfDays()]" x-cloak>
		<div class="container mx-auto px-4 py-2 md:py-24">
			  
			<!-- <div class="font-bold text-gray-800 text-xl mb-4">
				Schedule Tasks
			</div> -->

			<div class="bg-white rounded-lg shadow overflow-hidden">

	
				<div class="-mx-1 -mb-1">
				

					<div class="flex flex-wrap border-t border-l">
					
						<template x-for="(date, dateIndex) in no_of_days" :key="dateIndex">	
							<div style="width: 14.28%; height: 120px" class="px-4 pt-2 border-r border-b relative">
								<div
									@click="showEventModal(date)"
									x-text="date"
									class="inline-flex w-6 h-6 items-center justify-center cursor-pointer text-center leading-none rounded-full transition ease-in-out duration-100"
									:class="{'bg-blue-500 text-white': isToday(date) == true, 'text-gray-700 hover:bg-blue-200': isToday(date) == false }"	
								></div>
								<div style="height: 80px;" class="overflow-y-auto mt-1">

									<template x-for="event in events.filter(e => new Date(e.event_date).toDateString() ===  new Date(year, month, date).toDateString() )">	
										<div
											class="px-2 py-1 rounded-lg mt-1 overflow-hidden border"
											:class="{
												'border-blue-200 text-blue-800 bg-blue-100': event.event_theme === 'blue',
												'border-red-200 text-red-800 bg-red-100': event.event_theme === 'red',
												'border-yellow-200 text-yellow-800 bg-yellow-100': event.event_theme === 'yellow',
												'border-green-200 text-green-800 bg-green-100': event.event_theme === 'green',
												'border-purple-200 text-purple-800 bg-purple-100': event.event_theme === 'purple'
											}"
										>
											<p x-text="event.event_title" class="text-sm truncate leading-tight"></p>
										</div>
									</template>
								</div>
							</div>
						</template>
					</div>
				</div>
			</div>
		</div>
	</div>
  </div>
*/