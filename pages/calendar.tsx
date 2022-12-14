import type { GetStaticPropsContext, GetStaticPropsResult } from "next";
import Head from "next/head";
import { renderMetaTags, type SeoOrFaviconTag } from 'react-datocms';
import moment from "moment";

import Footer from "../components/Footer";
import Navbar, { type NavProps } from "../components/Navbar";
import { DATOCMS_Fetch } from "../lib/gql";
import Query from '../gql/queries/calendar';
import Calendar from "../components/Calendar";

interface CalendarProps extends NavProps {
    _site: {
        faviconMetaTags: SeoOrFaviconTag[];
    };
    allEvents: {
        id: string;
        slug: string;
        title: string;
        dateForm: string;
        dateTo: string;
    }[];
    calendar: {
        _seoMetaTags: SeoOrFaviconTag[]
    }
}

export const getStaticProps = async (ctx: GetStaticPropsContext): Promise<GetStaticPropsResult<CalendarProps>> => {

    const data = await DATOCMS_Fetch<CalendarProps>(Query,{ 
        preview: ctx.preview, 
        variables: {
            first: 20,
            date: moment().subtract(1,"months").toISOString()
        } 
    });
    
    return {
        props: data,
        // 12 hours
        revalidate: 43200
    }
}

export default function CalendarPage(props: CalendarProps){
    return (
        <div className="flex flex-col">
            <Head>
                {renderMetaTags([
                    ...props._site.faviconMetaTags,
                    ...props.calendar._seoMetaTags
                ])}
            </Head>
            <header>
                <Navbar {...props.navbar} mode="none"/>
            </header>
            <main className="flex flex-col">
                <Calendar data={props.allEvents}/>
            </main>
            <Footer/>
        </div>
    );
}