import { DatoCMS } from "@api/gql";
import SiteTags from "@components/SiteTags";
import { fetchCacheData } from "@lib/cache";
import GenericPageQuery from "@query/queries/generic";
import { FullPageProps } from "@type/page";
import type { GetStaticPropsResult, NextPage } from "next";
import { signOut } from 'next-auth/react';

export const getStaticProps = async (): Promise<GetStaticPropsResult<Omit<FullPageProps, "navbar" | "preview">>> => {
    const data = await fetchCacheData<FullPageProps>("GenericPage", () => DatoCMS(GenericPageQuery))

    return {
        props: {
            _site: data._site
        }
    }
}
const SignOut: NextPage<Omit<FullPageProps, "navbar" | "preview">> = ({ _site }) => {
    return (
        <div className="flex h-full items-center justify-center bg-neutral-200">
            <SiteTags tags={[_site.faviconMetaTags, [{ tag: "title", content: "Signout - Midwest Raptor Junkies" }]]} />
            <div className="block max-w-sm rounded-lg bg-white p-6 shadow-lg">
                <h5 className="mb-2 text-xl font-medium leading-tight text-neutral-800">
                    Signout
                </h5>
                <p className="mb-4 text-base text-neutral-600">
                    Are you sure you want to sign out?
                </p>
                <button onClick={() => signOut({ callbackUrl: "/" })}
                    type="button"
                    className="inline-block w-full rounded bg-primary px-6 pt-2.5 pb-2 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)]">
                    Sign out
                </button>
            </div>
        </div>
    );
}

export default SignOut;