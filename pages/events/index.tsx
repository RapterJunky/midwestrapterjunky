import type { GetStaticPropsContext, GetStaticPropsResult } from "next";
import { renderMetaTags, type SeoOrFaviconTag } from 'react-datocms';
import Footer from "../../components/Footer";
import Navbar, { NavProps } from "../../components/Navbar";
import { DATOCMS_Fetch } from "../../lib/gql";
import Query from '../../gql/queries/eventsPage';
import Head from "next/head";

interface EventsProps extends NavProps {
    _site: {
        faviconMetaTags: SeoOrFaviconTag[];
    };
    allEvents: any[];
}

export const getStaticProps = async (ctx: GetStaticPropsContext): Promise<GetStaticPropsResult<EventsProps>> => {

    const data = await DATOCMS_Fetch<EventsProps>(Query,{ 
        preview: ctx.preview, 
        variables: {
            first: 10
        } 
    });

    return {
        props: data
    }
}

export default function Events(props: EventsProps){
    return (
        <>
            <Head>
                {renderMetaTags([
                    ...props._site.faviconMetaTags
                ])}
            </Head>
            <header>
                <Navbar {...props.navbar} mode="none"/>
            </header>
            <main className="h-full">

            </main>
            <Footer/>
        </>
    );
}