import { GetStaticPropsContext, GetStaticPropsResult, GetStaticPathsContext, GetStaticPathsResult } from "next";
import Head from "next/head";
import Link from "next/link";
import { renderMetaTags, StructuredText, SeoOrFaviconTag } from 'react-datocms';
import Footer from "../../components/Footer";
import Navbar, { NavProps } from "../../components/Navbar";
import { DATOCMS_Fetch } from '../../lib/gql';
import { formatTime, formatTimeUser, formatUserDate } from "../../lib/timeFormat";
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
    shoptItem: string | null;
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

//https://wiki.openstreetmap.org/wiki/Export#Embeddable_HTML
export default function EventPage(props: EventPageProps){
    return (
        <div className="flex flex-col bg-gray-100">
            <Head>
                {renderMetaTags(props?._seoMetaTags ?? [])}
            </Head>
            <Navbar pageLinks={props.navbar.pageLinks} mode="none"/>
            <main className="container mx-auto">
                <header className="p-4 bg-zinc-400 mt-5">
                    <h1 className="text-white font-bold text-4xl">{props.title} | {formatTime(props.dateFrom,props.dateTo)}</h1>
                    <hr className="w-2/4 mt-2 mb-1"/>
                    <p className="text-gray-500 text-xs font-thin">Updated: {formatTimeUser(props.updatedAt)}</p>
                </header>
                <div className="flex flex-col md:flex-row my-5">
                    <article className="prose max-w-none px-2">
                        <StructuredText customMarkRules={markRules} data={props.description}/>
                    </article>
                    <aside className="flex flex-col gap-2 pl-2 md:w-2/4">
                        <div className="flex flex-col bg-zinc-400 p-3 text-white">
                            <p>Starting Date: {formatUserDate(props.dateFrom)}</p>
                            <div>Ending Date: {formatUserDate(props.dateTo)}</div>
                        </div>
                        {props.shoptItem ? <Button href={props.shoptItem} link>VIEW SHOP</Button> : null }
                        {props.location ? 
                        <iframe className="outline-none" width="425" height="350" loading="lazy"  
                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${props.location.longitude}%2C${props.location.latitude}&amp;layer=mapnik&amp;marker=39.91457919444492%2C-86.05805397033691`} 
                        ></iframe> : null }

                        <h6 className="font-bold">Links</h6>
                        <ul className="list-disc pl-4">
                            {props.links.map((link,i)=>(
                                <li className="list-item" key={i}><Link className="underline" href={link.link}>{link.title}</Link></li>
                            ))}
                        </ul>
                    </aside>
                </div>
                <section className="overflow-hidden text-gray-700">
                    <h4 className="font-bold text-xl pl-2">Gallery</h4>
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
/*
<iframe width="425" height="350" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="https://www.openstreetmap.org/export/embed.html?bbox=-86.06323063373567%2C39.91179360853309%2C-86.05427205562593%2C39.915661304356085&amp;layer=mapnik&amp;marker=39.91372748374549%2C-86.05875134468079" style="border: 1px solid black"></iframe><br/><small><a href="https://www.openstreetmap.org/?mlat=39.91373&amp;mlon=-86.05875#map=18/39.91373/-86.05875">View Larger Map</a></small>
"https://www.openstreetmap.org/export/embed.html?bbox=-86.06323063373567%2C39.91179360853309%2C-86.05427205562593%2C39.915661304356085&amp;layer=mapnik&amp;marker=39.91372748374549%2C-86.05875134468079"
*/