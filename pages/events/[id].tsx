import { GetStaticPropsContext, GetStaticPropsResult, GetStaticPathsContext, GetStaticPathsResult } from "next";
import Head from "next/head";
import Link from "next/link";
import { renderMetaTags, StructuredText, SeoOrFaviconTag } from 'react-datocms';
import Footer from "../../components/Footer";
import Navbar, { NavProps } from "../../components/Navbar";
import { DATOCMS_Fetch } from '../../lib/gql';
import { formatTime, formatTimeUser } from "../../lib/timeFormat";
import EventPageQuery from '../../gql/queries/event';
import EventsQuery from '../../gql/queries/events';
import { markRules } from "../../lib/StructuredTextRules";
import Button from "../../components/Button";

interface EventPageProps extends NavProps {
    dateTo: string;
    dateFrom: string;
    title: string;
    updatedAt: string;
    location: {
        latitude: number;
        longitude: number;
    }
    links: { link: string; title: string; }[];
    id: string;
    description: any;
    gallery: { url: string; alt: string; }[];
    _seoMetaTags: SeoOrFaviconTag[];
}

export const getStaticProps = async (ctx: GetStaticPropsContext): Promise<GetStaticPropsResult<EventPageProps>> => {

    const data = await DATOCMS_Fetch<{ event: EventPageProps, navbar: NavProps["navbar"] } >(EventPageQuery,{ 
        variables: { 
            eq: ctx.params?.id ?? "" 
        }, 
        preview: ctx.preview 
    });

    return {
        props: { ...data.event, navbar: data.navbar }
    }
}

export async function getStaticPaths(ctx: GetStaticPathsContext): Promise<GetStaticPathsResult<{ id: string; }>> {

    const data = await DATOCMS_Fetch<{ allEvents: {id: string;}[] }>(EventsQuery);

    const paths = data.allEvents.map(value=>({
        params: { id: value.id }
    }));

    return {
        paths,
        fallback: false
    }
}

//https://docs.mapbox.com/api/overview/
//https://wiki.openstreetmap.org/wiki/Export#Embeddable_HTML
export default function EventPage(props: EventPageProps){
    return (
        <div className="flex flex-col bg-zinc-200 h-full">
            <Head>
                {renderMetaTags(props?._seoMetaTags ?? [])}
            </Head>
            <Navbar pageLinks={props.navbar.pageLinks} mode="none"/>
            <main className="container mx-auto h-full">
                <header className="p-4 bg-gray-400 mt-5">
                    <h1 className="text-white font-bold text-4xl">{props.title} | {formatTime(props.dateFrom,props.dateTo)}</h1>
                    <hr className="w-2/4 mt-2 mb-1"/>
                    <p className="text-gray-500 text-xs font-thin">Updated: {formatTimeUser(props.updatedAt)}</p>
                </header>
                <div className="flex my-5">
                    <article className="px-10">
                        <StructuredText customMarkRules={markRules} data={props.description}/>
                    </article>
                    <aside className="flex flex-col gap-1">
                        <div className="flex flex-col bg-gray-400 p-3 text-white">
                            <p>{props.dateFrom}</p>
                            <div>{props.dateTo}</div>
                        </div>
                        <Button href="/" link>VIEW SHOP</Button>
                        <iframe 
                        frameBorder="0" 
                        className="border-none outline-none visually-hidden-focusable" 
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://www.google.com/maps/embed/v1/view?center=${props.location.latitude},${props.location.longitude}`}
                        allowFullScreen
                        ></iframe>
                        <h6 className="font-bold">Links</h6>
                        <ul className="list-disc pl-4">
                            {props.links.map((link,i)=>(
                                <li className="list-item" key={i}><Link className="underline" href={link.link}>{link.title}</Link></li>
                            ))}
                        </ul>
                    </aside>
                </div>
                <section className="overflow-hidden text-gray-700">
                    <h4 className="font-bold text-xl">Gallery</h4>
                    <hr className="w-full mt-1 mb-1 bg-slate-600 h-0.5"/>
                    <div className="container px-5 py-2 mx-auto lg:pt-12 lg:px-32">
                    <div  className="flex flex-wrap -m-1 md:-m-2">
                        {props.gallery.map((value,i)=>(
                          
                                <div key={i} className="flex flex-wrap w-1/3">
                                    <div className="w-full p-1 md:p-2">
                                        <img alt={value.alt} className="block object-cover object-center w-full h-full rounded-lg"
                                            src={value.url}/>
                                    </div>
                                </div>
                        ))}
                         </div>
                    </div>
                </section>
            </main>
            <Footer/>
        </div>
    )
}
