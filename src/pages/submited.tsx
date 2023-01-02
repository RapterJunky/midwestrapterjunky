import type { GetStaticPropsContext } from 'next';
import { useRouter } from 'next/router';
import ExitPreview from '@components/ExitPreview';
import Footer from '@components/Footer';
import SiteTags from '@components/SiteTags';

import { DATOCMS_Fetch } from "@lib/gql";
import Query from '@query/queries/generic';
import Navbar from '@components/Navbar';
import type { FullPageProps } from '@lib/types';

export async function getStaticProps(ctx: GetStaticPropsContext){
    const data = await DATOCMS_Fetch(Query,{ 
        preview: ctx.preview
    });


    return {
        props: {
            ...data,
            preview: ctx.preview ?? false
        }
    }
}

export default function Submited(props: FullPageProps){
    const router = useRouter();

    return (
        <div className="h-full flex flex-col">
        
            <SiteTags tags={[ props._site.faviconMetaTags, [ 
                { tag: "title", content: "Midwest Rapter Junkies | Submited."  },
                { tag: "meta", attributes: { name: "robots", content: "noindex,nofollow" } }
                 ] ]}/>
            <Navbar mode="none" {...props.navbar} />
            <main className="flex flex-col flex-grow justify-center items-center">
                {  router.query.ok === "true" ? (
                    <>
                        <h1 className="text-4xl font-bold p-2">Thank you.</h1>
                        <p className="text-2xl font-serif font-medium">Your email was add to the mailing list.</p>
                    </>
                ) : (
                    <>
                        <h1 className="text-4xl font-bold p-2">There was an issue!</h1>
                        <p className="text-2xl font-serif font-medium">{router.query?.error ??  "Was not able to add your email to the mailing list."}</p>
                    </>
                ) }
            </main>
            <Footer/>
            { props.preview ? <ExitPreview/> : null }
        </div>
    );
}