import type { FaviconAttributes, SeoOrFaviconTag } from "react-datocms/seo";
import { type getProviders, signIn } from "next-auth/react";
import type { NextPage, GetStaticPropsResult } from "next";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";

import FontAwesomeIcon from "@components/FontAwesomeIcon"
import SiteTags from "@components/SiteTags";

import genericSeoTags from "@lib/utils/genericSeoTags";
import GenericPageQuery from "@query/queries/generic";
import type { FullPageProps } from "@type/page";
import { fetchCachedQuery } from "@lib/cache";

type Provider = Awaited<ReturnType<typeof getProviders>>;
interface Props {
  providers: Partial<Provider>;
  _site: Omit<FullPageProps, "preview" | "navbar">["_site"];
  seo: SeoOrFaviconTag[],
  icon: string;
}

export const getStaticProps = async (): Promise<
  GetStaticPropsResult<Props>
> => {
  const providers = {
    google: {
      id: "google",
      name: "Google",
      type: "oauth",
      signinUrl: "",
      callbackUrl: "",
    },
  } satisfies Partial<Provider>;
  const data = await fetchCachedQuery<FullPageProps>(
    "GenericPage",
    GenericPageQuery
  );

  const icon = (data._site.faviconMetaTags ?? []).find(
    (value) => value.tag === "link" && value.attributes.sizes === "96x96"
  );

  return {
    props: {
      providers,
      icon: (icon?.attributes as FaviconAttributes)?.href ?? "",
      _site: data._site,
      seo: genericSeoTags({
        title: "SignIn",
        description: "Login page for Midwest Raptor Junkies."
      })
    },
  };
};

/**
 * @author HyperUI
 * @see https://www.hyperui.dev/components/application-ui/login-forms
 */
const SignIn: NextPage<Props> = ({ _site, seo, providers, icon }) => {
  const router = useRouter();
  const callbackUrl = decodeURI(router?.query?.callbackUrl as string ?? "/");

  return (
    <div className="lg:grid lg:min-h-screen lg:grid-cols-12">
      <SiteTags tags={[_site.faviconMetaTags, seo]} />
      <section className="relative flex h-32 items-end bg-gray-900 lg:col-span-5 lg:h-full xl:col-span-6">
        <Image
          src="https://www.datocms-assets.com/77949/1676234561-220865184_6246667838678383_7191752647666209634_n.webp"
          alt="signup background"
          fill
          className="inset-0 h-full w-full object-cover opacity-80"
        />
        <div className="hidden lg:relative lg:block lg:p-12">
          <Link className="block text-white" href="/">
            <span className="sr-only">Home</span>
            <Image
              src={icon}
              height={70}
              width={70}
              alt="logo"
            />
          </Link>
          <h2 className="mt-6 text-2xl font-bold text-white sm:text-3xl md:text-4xl">
            Welcome to Midwest Raptor Junkies
          </h2>
          <p className="mt-4 leading-relaxed text-white/90">
            A place with all the raptor knowledge you need.
          </p>
        </div>
      </section>
      <main
        aria-label="Main"
        className="flex items-center justify-center px-8 py-8 sm:px-12 lg:col-span-7 lg:px-16 lg:py-12 xl:col-span-6"
      >
        <div className="max-w-xl lg:max-w-3xl">
          <div className="relative -mt-16 block lg:hidden">
            <Link
              className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white text-blue-600 sm:h-20 sm:w-20"
              href="/"
            >
              <span className="sr-only">Home</span>
              <Image
                src={icon}
                height={48}
                width={48}
                alt="logo"
              />
            </Link>
            <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl">
              Welcome to Midwest Raptor Junkies
            </h1>
            <p className="mt-4 leading-relaxed text-gray-500">
              A place with all the raptor knowledge you need.
            </p>
          </div>
          <div className="mt-8 grid grid-cols-6 gap-6">
            <div className="col-span-6">
              {Object.values(providers ?? {}).map((provider) => (
                <button
                  className="mb-2 flex w-full items-center justify-center gap-1 rounded bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)]"
                  type="submit"
                  key={provider?.id}
                  onClick={async () => signIn(provider?.id, {
                    callbackUrl,
                  })}
                >
                  <FontAwesomeIcon iconName="google" prefix="fa" icon={[488, 512, [], "", "M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"]} /> continue with {provider?.name}
                </button>
              ))}
            </div>

            <hr className="col-span-6" />

            <div className="col-span-6">
              <p className="text-sm text-gray-500">
                By creating an account, you agree to our
                <Link
                  href="/terms-of-service"
                  className="mx-1 text-gray-700 underline"
                >
                  terms of service
                </Link>
                and
                <Link
                  href="/privacy-policy"
                  className="ml-1 text-gray-700 underline"
                >
                  privacy policy
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SignIn;
