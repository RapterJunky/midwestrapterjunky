import type { Metadata } from "next";

import getGenericSeoTags from "@lib/helpers/getGenericSeoTags";
import getFullPageProps from "@lib/cache/getFullPageProps";
import SignoutBtn from "@components/pages/signout/SignoutBtn";

export async function generateMetadata(): Promise<Metadata> {
    const data = await getFullPageProps();

    return getGenericSeoTags({
        icons: data._site.faviconMetaTags,
        description: "Signout page for Midwest Raptor Junkies.",
        title: "Signout"
    });
}

const Page = async () => {
    return (
        <div className="flex h-full items-center justify-center bg-neutral-200">
            <div className="block max-w-sm rounded-lg bg-white p-6 shadow-lg">
                <h5 className="mb-2 text-xl font-medium leading-tight text-neutral-800">
                    Signout
                </h5>
                <p className="mb-4 text-base text-neutral-600">
                    Are you sure you want to sign out?
                </p>
                <SignoutBtn />
            </div>
        </div>
    );
}

export default Page;