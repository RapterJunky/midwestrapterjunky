import type { GetStaticPropsContext, GetStaticPropsResult, GetStaticPathsContext, GetStaticPathsResult } from "next";
import { StructuredText, type SeoOrFaviconTag } from 'react-datocms';
import Image from "next/image";


import StoreButtonLink from "@components/StoreButtonLink";
import IconLink from "@components/IconLink";
import ExitPreview from "@components/ExitPreview";
import SiteTags from "@components/SiteTags";
import Footer from "@components/Footer";
import Navbar, { NavProps } from "@components/Navbar";

import prisma from "@lib/prisma";
import { DATOCMS_Fetch } from '@lib/gql';
import { formatTime, formatTimeUser } from "@lib/utils/timeFormat";

import EventPageQuery from '@query/queries/event';
import EventsQuery from '@query/queries/events';
import { markRules } from "@lib/StructuredTextRules";

import type { ResponsiveImage, StructuredContent, LinkWithIcon   } from '@lib/types';
import type { ShopType } from "@hook/plugins/useStore";

interface EventPageProps extends NavProps {
    site: any;
    id: string;
    updatedAt: string;
    dateTo: string;
    dateFrom: string;
    title: string;
    slug: string;
    shopItemLink: null | { type: ShopType, handle: string; } 
    location: {
        latitude: number;
        longitude: number;
    } | null;
    links: LinkWithIcon[];
    description: StructuredContent;
    extraLocationDetails: string | null;
    gallery: ResponsiveImage[];
    _seoMetaTags: SeoOrFaviconTag[];
    preview: boolean;
}

const getPages = async () => {
    const data = await DATOCMS_Fetch<{ allEvents: {id: string; slug: string; }[] }>(EventsQuery);

    const paths = data.allEvents.map(value=>({
        params: { id: value.slug }
    }));

    await prisma.cache.upsert({
        create: {
            key: "event-pages",
            data: data.allEvents,
            isDirty: false
        },
        update: {
            data: data.allEvents,
            isDirty: false
        },
        where: {
            key: "event-pages"
        }
    });

    return {paths, events: data.allEvents };
}

const getPage = async (id: string = "", preview: boolean = false) => {
    const data = await DATOCMS_Fetch<{ event: EventPageProps, navbar: NavProps["navbar"], _site: { faviconMetaTags: any[] }; } >(EventPageQuery,{ 
        variables: { 
            eq: id 
        }, 
        preview 
    });
    return data;
}

export const getStaticProps = async (ctx: GetStaticPropsContext): Promise<GetStaticPropsResult<EventPageProps>> => {
    if(ctx.preview) {
        const data = await getPage(ctx.params?.id as string,ctx.preview);
        return {
            props: { ...data.event, navbar: data.navbar }
        }
    }

    let pages = await prisma.cache.findUnique({ where: { key: "event-pages" } });

    let content = pages?.data as { id: string; slug: string; }[] | undefined;

    if(!pages || !content || pages.isDirty) {
        const {events} = await getPages();
        content = events;
    }

    if(content.findIndex(value=>value.slug === ctx.params?.id) === -1) {
        return {
            notFound: true
        }
    }

    const data = await getPage(ctx.params?.id as string,ctx.preview);

    return {
        props: { ...data.event, navbar: data.navbar, site: data._site, preview: ctx?.preview ?? false }
    }
}

export async function getStaticPaths(ctx: GetStaticPathsContext): Promise<GetStaticPathsResult<{ id: string; }>> {
    const {paths} = await getPages();

    // switch to using fallback only to reduce build times.

    return {
        paths,
        fallback: "blocking"
    }
}
// {props.shoptItem ? <Button href={props.shoptItem} link>VIEW SHOP</Button> : null }
//https://wiki.openstreetmap.org/wiki/Export#Embeddable_HTML
export default function EventPage(props: EventPageProps){
    return (
        <div className="flex flex-col flex-grow">
            <SiteTags tags={[ props._seoMetaTags, props.site.faviconMetaTags ]}/>
            <Navbar {...props.navbar} mode="none"/>
            <header className="my-4 mx-4">
                <h1 className="ml-4 text-2xl font-bold mb-1">{props.title} | {formatTime(props.dateFrom,props.dateTo)}</h1>
                <hr className="ml-4 border-t-2 border-gray-300"/>
                <span className="ml-4 text-sm font-extralight">Updated: {formatTimeUser(props.updatedAt)}</span>
            </header>
            <main className="container mx-auto flex flex-grow flex-col justify-center h-max">
                <section className="flex flex-col sm:flex-row flex-warp items-start w-full gap-2 mb-4">
                    <article className="prose sm:w-3/4 max-w-none mx-10">
                        <StructuredText customMarkRules={markRules} data={props.description}/>
                    </article>
                    <div className="md:ml-6 flex flex-col h-full w-full sm:w-1/4 flex-grow items-center bg-gray-500 shadow rounded-sm text-white mb-2">
                        <div className="p-4 text-right w-full">
                            <h2 className="font-bold text-white mb-1">Event Details</h2>
                            <hr className="border-gray-200 w-full mx-2"/>
                        </div>
                        { (!props?.shopItemLink && !(props.location || props.extraLocationDetails) && (!props.links || props.links.length === 0)) ? (
                            <div className="mb-3 text-center">No details where provided.</div>
                        ) : null  }
                        { props?.shopItemLink ? (
                            <div className="px-4 w-full">
                                <StoreButtonLink {...props.shopItemLink}/>
                            </div>
                        ) : null }
                        {props.location || props.extraLocationDetails ? (
                            <div className="w-full p-4 flex flex-col">
                                <h3>Location Details</h3>
                                <hr className="mb-2"/>
                                {props.extraLocationDetails ? (
                                    <p className="my-2">{props.extraLocationDetails}</p>
                                ) : null}
                                {props.location ? (
                                    <iframe className="outline-none w-full" loading="lazy" height={350}
                                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${props.location.longitude}%2C${props.location.latitude}&amp;layer=mapnik&amp;marker=39.91457919444492%2C-86.05805397033691`} 
                                    ></iframe>
                                ) : null}
                            </div>
                        ) : null }
                        { props.links && props.links.length > 0 ? (
                            <div className="w-full px-4">
                                <h3 className="font-bold">Links</h3>
                                <hr/>
                                <ul className="list-disc ml-3">
                                    {props.links.map((value,i)=>(
                                        <li key={i} className="p-1">
                                            <IconLink {...value} className="text-blue-600 hover:text-blue-400 underline"/>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : null}
                    </div>
                </section>
                { props.gallery && props.gallery.length > 0 ? (
                    <section className="flex flex-col justify-center items-center gap-2 my-4">
                        <div className="w-full flex flex-col justify-start p-2">
                            <h2 className="font-bold">Image Gallery</h2>
                            <hr className="w-full"/>
                        </div>
                        <div className="container max-w-none flex flex-wrap gap-2 px-4">
                            {props.gallery.map((value,i)=>(
                                <div key={i} className="relative h-40 w-40">
                                    <Image fill sizes={value.responsiveImage.sizes} alt={value.responsiveImage?.alt ?? ""} className="block object-cover object-center w-full h-full rounded-lg"
                                    src={value.responsiveImage.src}/>
                                </div>
                            ))}
                        </div>
                    </section> 
                ) : null }
            </main>
            <div className="h-20">
                <Footer/>
            </div>
            { props.preview ? <ExitPreview/> : null }
        </div>
    )
}