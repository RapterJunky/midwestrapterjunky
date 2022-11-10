import { GetStaticPropsContext, GetStaticPropsResult, GetStaticPathsContext, GetStaticPathsResult } from "next";
import Head from "next/head";
import Link from "next/link";
import { renderMetaTags, StructuredText } from 'react-datocms';
import Footer from "../../components/Footer";
import Navbar, { NavProps } from "../../components/Navbar";
import { DATOCMS_Fetch } from '../../lib/gql';
import { formatTime, formatTimeUser } from "../../lib/timeFormat";
import EventPageQuery from '../../gql/queries/event';
import EventsQuery from '../../gql/queries/events';

interface EventPageProps extends NavProps {
    dateTo: string;
    dataFrom: string;
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
    _seoMetaTags: any[];
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

export default function EventPage(props: EventPageProps){
    return (
        <div className="flex flex-col bg-slate-100">
            <Head>
                {renderMetaTags(props?._seoMetaTags ?? [])}
            </Head>
            <Navbar pageLinks={props.navbar.pageLinks} fixed={false}/>
            <main className="container mx-auto my-9">
                <header className="p-4 bg-gray-400">
                    <h1 className="text-white font-bold text-2xl">{props.title} | {formatTime(props.dataFrom,props.dateTo)}</h1>
                    <p className="text-gray-500 text-xs font-thin">Updated: {formatTimeUser(props.updatedAt)}</p>
                </header>

                <article className="px-14 my-5">
                    <StructuredText data={props.description}/>
                </article>

                { props.location ? <section>
                    <iframe 
                    frameBorder="0" 
                    className="border-none" 
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps/embed/v1/view?key=&center=${props.location.latitude},${props.location.longitude}`}
                    allowFullScreen
                    ></iframe>
                </section> : null }

                <section className="overflow-hidden text-gray-700 ">
                    <div className="container px-5 py-2 mx-auto lg:pt-12 lg:px-32">
                        {props.gallery.map((value,i)=>(
                            <div key={i} className="flex flex-wrap -m-1 md:-m-2">
                                <div className="flex flex-wrap w-1/3">
                                    <div className="w-full p-1 md:p-2">
                                        <img alt={value.alt} className="block object-cover object-center w-full h-full rounded-lg"
                                            src={value.url}/>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
                
                <div>
                    <h3>Links</h3>
                    <section className="flex h-10 p-1 bg-gray-400 items-center my-4">
                        {props.links.map((link,i)=>(
                            <Link className="text-blue-700 underline" key={i} href={link.link}>{link.title}</Link>
                        ))}
                    </section>
                </div>
            </main>
            <Footer/>
        </div>
    )
}