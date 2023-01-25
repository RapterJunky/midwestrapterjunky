import type { GetStaticPropsContext, GetStaticPropsResult, NextPage } from "next";
import type { SeoOrFaviconTag } from "react-datocms";

import Footer from "@components/Footer";
import Navbar from "@components/Navbar";
import SiteTags from "@components/SiteTags";
import ExitPreview from "@components/ExitPreview";

import type { FullPageProps, ResponsiveImage } from "@lib/types";
import { DATOCMS_Fetch } from "@lib/gql";
import Link from "next/link";
import Image from "next/image";
import SponsorsQuery from "@query/queries/sponsors";


interface PageProps extends FullPageProps {
    sponsor: {
        seo: SeoOrFaviconTag[],
        sponsors: {
            link: string | null;
            sponsorName: string;
            id: string;
            logo: ResponsiveImage
        }[]
    }
}

export const getStaticProps = async (ctx: GetStaticPropsContext): Promise<GetStaticPropsResult<PageProps>> => {
    
    const data = await DATOCMS_Fetch<PageProps>(SponsorsQuery,{
        preview: ctx.preview
    })
    
    return {
        props: data
    }
}

const SponsorsPage: NextPage<PageProps> = ({ preview, _site, navbar, sponsor }) => {

    return (
        <div className="flex flex-col h-full">
            <SiteTags tags={[_site.faviconMetaTags, sponsor.seo]}/>
            <Navbar {...navbar} mode="none"/>
            <main className="flex flex-col gap-6 items-center flex-grow w-full justify-center divide-y divide-gray-300 mb-4">
                <h1 className="my-4 text-3xl font-extrabold leading-9 tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-5xl md:leading-14">Our Sponsors</h1>
                <section className="px-4 md:px-0 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-7xl pt-4">
                    { sponsor.sponsors.map((value)=>(
                        <Link key={value.id} href={value.link ?? ""} className="hover:bg-gray-300 bg-gray-200 p-2 h-48 w-full flex justify-center items-center rounded-sm">
                            <div className="relative h-20 w-20">
                                <Image className="object-center object-cover" src={value.logo.responsiveImage.src} alt={value.logo.responsiveImage.alt ?? value.sponsorName} sizes={value.logo.responsiveImage.sizes} fill/>
                            </div>
                        </Link>
                    )) }
                </section>
            </main>
            <div className="h-20 w-full">
                <Footer/>
            </div>
            { preview ? <ExitPreview/> : null }
        </div>
    );
}

export default SponsorsPage;