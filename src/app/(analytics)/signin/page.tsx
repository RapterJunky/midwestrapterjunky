import type { FaviconAttributes } from "react-datocms/seo";
import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";

import getGenericSeoTags from "@lib/helpers/getGenericSeoTags";
import SignInList from "@components/pages/signin/SignList";
import getFullPageProps from "@lib/cache/getFullPageProps";

export async function generateMetadata(): Promise<Metadata> {
  const data = await getFullPageProps();

  return getGenericSeoTags({
    icons: data._site.faviconMetaTags,
    description: "Login page for Midwest Raptor Junkies.",
    title: "SignIn",
    url: "https://midwestraptorjunkies.com/signin",
  });
}

const getIcon = async () => {
  const data = await getFullPageProps();
  const icon = data._site.faviconMetaTags.find(
    (value) => value.tag === "link" && value.attributes.sizes === "96x96",
  );
  return (icon?.attributes as FaviconAttributes)?.href;
};

const BtnLoading: React.FC = () => {
  return (
    <>
      <div
        className="mb-2 min-h-[0.5em] w-full flex-auto animate-pulse cursor-wait rounded-sm bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white opacity-50 shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out before:inline-block before:content-[''] hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)]"
        aria-hidden="true"
      ></div>
      <div
        className="min-h-[0.5em] w-full flex-auto animate-pulse cursor-wait rounded-sm bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white opacity-50 shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out before:inline-block before:content-[''] hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)]"
        aria-hidden="true"
      ></div>
    </>
  );
};

const SignIn = async () => {
  const icon = await getIcon();
  return (
    <div className="lg:grid lg:min-h-screen lg:grid-cols-12">
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
            <Image src={icon} height={70} width={70} alt="logo" />
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
              <Image src={icon} height={48} width={48} alt="logo" />
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
              <Suspense fallback={<BtnLoading />}>
                <SignInList />
              </Suspense>
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
