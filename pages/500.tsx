import type { GetStaticPropsContext, GetStaticPropsResult } from 'next';
import type { SeoOrFaviconTag } from 'react-datocms';
import SiteTags from '../components/SiteTags';

import { DATOCMS_Fetch } from "../lib/gql";
import Query from '../gql/queries/generic';

type PageProps = {
    _site: {
        faviconMetaTags: SeoOrFaviconTag[];
    }
};

export const getStaticProps = async (ctx: GetStaticPropsContext): Promise<GetStaticPropsResult<PageProps>> => {
    const data = await DATOCMS_Fetch<PageProps>(Query,{ 
        preview: ctx.preview
    });
    return {
        props: data
    }
}

/**
 * @author Vojislav
 * @see https://tailwindcomponents.com/u/vojislav
 *
 * @export
 * @return {*} 
 */
export default function ErrorPage500(props: PageProps){
    return (
        <div className="bg-gray-200 w-full px-16 md:px-0 h-screen flex-grow flex items-center justify-center">
            <SiteTags tags={[ props._site.faviconMetaTags, [
                 { tag: "title", content: "Midwest Rapter Junkies | Server Error" },
                 { tag: "meta", attributes: { name: "robots", content: "noindex,nofollow" } }
            ] ]}/>
            <div className="bg-white border border-gray-200 flex flex-col items-center justify-center px-4 md:px-8 lg:px-24 py-8 rounded-lg shadow-2xl">
                <p className="text-6xl md:text-7xl lg:text-9xl font-bold tracking-wider text-gray-300">500</p>
                <p className="text-2xl md:text-3xl lg:text-5xl font-bold tracking-wider text-gray-500 mt-4">Server Error</p>
                <p className="text-gray-500 mt-8 py-2 border-y-2 text-center">Whoops, something went wrong on our end.</p>
            </div>
        </div>
    );
}