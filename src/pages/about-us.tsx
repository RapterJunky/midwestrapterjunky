import type { GetStaticPropsContext, GetStaticPropsResult } from "next";
import { StructuredText, type SeoOrFaviconTag } from 'react-datocms';
import Image from 'next/image';

import ExitPreview from "@components/ExitPreview";
import Footer from "@components/Footer";
import ModuleContent from "@components/ModuleContent";
import Navbar, { type NavProps } from "@components/Navbar";
import SiteTags from "@components/SiteTags";

import about_us from "@query/queries/about_us";
import { DATOCMS_Fetch } from "@lib/gql";
import { markRules } from "@lib/StructuredTextRules";

interface AboutUsProps extends NavProps {
    _site: {
        faviconMetaTags: SeoOrFaviconTag[];
    }
    preview: boolean;
    aboutUsModel: {
        _seoMetaTags: SeoOrFaviconTag[];
        imageTitle: string;
        title: string;
        content: any;
        footerContent: any;
        image: {
            alt: string | null;
            blurUpThumb: string;
            responsiveImage: {
                sizes: string
              }
            url: string;
        }
    }

}

export const getStaticProps = async (ctx: GetStaticPropsContext): Promise<GetStaticPropsResult<AboutUsProps>> => {
    const data = await DATOCMS_Fetch<AboutUsProps>(about_us,{ preview: ctx.preview });

    return {
        props: {
            ...data,
            preview: ctx?.preview ?? false
        }
    }
}

export default function AboutUs(props: AboutUsProps){
    return (
        <>
            <SiteTags tags={[ props._site.faviconMetaTags, props.aboutUsModel._seoMetaTags ]}/>
            <header>
                <Navbar {...props.navbar} mode="only-scroll"/>
            </header>
            <main>
                <div className="flex flex-col md:flex-row mt-40 mb-9 gap-4 md:mx-40">
                    <article className="md:w-2/3 flex flex-col gap-3 p-3">
                        <div className="flex justify-center mb-4"> 
                            <h1 className="font-bold text-2xl">{props.aboutUsModel.title}</h1>
                        </div>
                        <StructuredText customMarkRules={markRules} data={props.aboutUsModel.content}/>
                    </article>
                    <aside className="flex flex-col md:w-1/3 px-3">
                        <div className="relative h-80 w-full">
                            <Image className="object-contain object-top" src={props.aboutUsModel.image.url} alt={props.aboutUsModel.image.alt ?? "Article Image"} fill sizes={props.aboutUsModel.image.responsiveImage.sizes} blurDataURL={props.aboutUsModel.image.blurUpThumb}/>
                        </div>
                        <div className="flex justify-center">
                            <h5 className="font-bold">{props.aboutUsModel.imageTitle}</h5>
                        </div>
                    </aside>
                </div>
                <ModuleContent data={props.aboutUsModel.footerContent}/>
            </main>
            <Footer/>
            { props.preview ? <ExitPreview/> : null }
        </>
    );
}