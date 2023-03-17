import { DatoCMS } from "@api/gql";
import SiteTags from "@components/SiteTags";
import { fetchCacheData } from "@lib/cache";
import GenericPageQuery from "@query/queries/generic";
import { FullPageProps } from "@type/page";
import type { NextPage, GetStaticPropsResult, GetStaticPropsContext } from "next";
import { getProviders, signIn } from "next-auth/react"
import Image from "next/image";
import Link from "next/link";
import type { FaviconAttributes } from "react-datocms/seo";
import { FaGoogle } from 'react-icons/fa';

interface Props {
    providers: Awaited<ReturnType<typeof getProviders>>,
    seo: Omit<FullPageProps, "preview" | "navbar">["_site"]
}

export const getStaticProps = async (ctx: GetStaticPropsContext): Promise<GetStaticPropsResult<Props>> => {
    const providers = await getProviders();
    const data = await fetchCacheData<FullPageProps>("GenericPage", () => DatoCMS(GenericPageQuery))

    return {
        props: {
            providers,
            seo: data._site
        }
    }
}

/**
 * @author HyperUI 
 * @see https://www.hyperui.dev/components/application-ui/login-forms
 */
const SignIn: NextPage<Props> = ({ seo, providers }) => {
    const icon = (seo.faviconMetaTags ?? []).find(value => value.tag === "link" && value.attributes.sizes === "96x96");
    return (
        <div className="lg:grid lg:min-h-screen lg:grid-cols-12">
            <SiteTags tags={[seo.faviconMetaTags, [{ tag: "title", content: "SignIn - Midwest Raptor Junkies" }]]} />
            <section className="relative flex h-32 items-end bg-gray-900 lg:col-span-5 lg:h-full xl:col-span-6">
                <Image src="https://www.datocms-assets.com/77949/1676234561-220865184_6246667838678383_7191752647666209634_n.webp" alt="signup background" fill className="inset-0 h-full w-full object-cover opacity-80" />
                <div className="hidden lg:relative lg:block lg:p-12">
                    <a className="block text-white" href="/">
                        <span className="sr-only">Home</span>
                        <Image src={(icon?.attributes as FaviconAttributes)?.href ?? ""} height={70} width={70} alt="logo" />
                    </a>
                    <h2 className="mt-6 text-2xl font-bold text-white sm:text-3xl md:text-4xl">
                        Welcome to Midwest Raptor Junkies
                    </h2>
                    <p className="mt-4 leading-relaxed text-white/90">
                        A place with all the raptor knowledge you need.
                    </p>
                </div>
            </section>
            <main aria-label="Main" className="flex items-center justify-center px-8 py-8 sm:px-12 lg:col-span-7 lg:py-12 lg:px-16 xl:col-span-6">
                <div className="max-w-xl lg:max-w-3xl">
                    <div className="relative -mt-16 block lg:hidden">
                        <a className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white text-blue-600 sm:h-20 sm:w-20" href="/">
                            <span className="sr-only">Home</span>
                            <Image src={(icon?.attributes as FaviconAttributes)?.href ?? ""} height={48} width={48} alt="logo" />
                        </a>
                        <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl">
                            Welcome to Midwest Raptor Junkies
                        </h1>
                        <p className="mt-4 leading-relaxed text-gray-500">
                            A place with all the raptor knowledge you need.
                        </p>
                    </div>
                    <div className="mt-8 grid grid-cols-6 gap-6">

                        <div className="col-span-6">
                            {Object.values(providers ?? {}).map(provider => (
                                <button className="mb-2 flex justify-center items-center gap-1 w-full rounded bg-primary px-6 pt-2.5 pb-2 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)]" type="submit" key={provider.id} onClick={() => signIn(provider.id, { callbackUrl: "/" })}>
                                    <FaGoogle /> continue with {provider.name}
                                </button>
                            ))}

                        </div>

                        <hr className="col-span-6" />

                        <div className="col-span-6">
                            <p className="text-sm text-gray-500">
                                By creating an account, you agree to our
                                <Link href="/terms-of-service" className="text-gray-700 underline mx-1">
                                    terms of service
                                </Link>
                                and
                                <Link href="/privacy-policy" className="text-gray-700 underline ml-1">privacy policy</Link>.
                            </p>
                        </div>


                    </div>
                </div>
            </main>
        </div>
    );
}

/*
<div className="col-span-6 sm:flex sm:items-center sm:gap-4">
                            <p className="mt-4 text-sm text-gray-500 sm:mt-0">
                                Already have an account?
                                <Link href="/signin" className="text-gray-700 underline ml-1">Log in</Link>.
                            </p>
                        </div>
*/

export default SignIn;