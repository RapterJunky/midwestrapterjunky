import type { GetStaticPropsResult, NextPage } from "next";
import type { SeoOrFaviconTag } from "react-datocms/seo";
import { signOut } from "next-auth/react";

import SiteTags from "@components/SiteTags";

import genericSeoTags from "@lib/utils/genericSeoTags";
import GenericPageQuery from "@query/queries/generic";
import type { FullPageProps } from "@type/page";
import { fetchCachedQuery } from "@lib/cache";

type Props = Omit<FullPageProps, "navbar" | "preview"> & { seo: SeoOrFaviconTag[] };

export const getStaticProps = async (): Promise<
  GetStaticPropsResult<Props>
> => {
  const data = await fetchCachedQuery<FullPageProps>(
    "GenericPage",
    GenericPageQuery
  );

  return {
    props: {
      seo: genericSeoTags({
        title: "Signout",
        robots: false,
        description: "Signout page for Midwest Raptor Junkies."
      }),
      _site: data._site,
    },
  };
};
const SignOut: NextPage<Props> = ({ _site, seo }) => {
  return (
    <div className="flex h-full items-center justify-center bg-neutral-200">
      <SiteTags
        tags={[
          _site.faviconMetaTags,
          seo
        ]}
      />
      <div className="block max-w-sm rounded-lg bg-white p-6 shadow-lg">
        <h5 className="mb-2 text-xl font-medium leading-tight text-neutral-800">
          Signout
        </h5>
        <p className="mb-4 text-base text-neutral-600">
          Are you sure you want to sign out?
        </p>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          type="button"
          className="inline-block w-full rounded bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)]"
        >
          Sign out
        </button>
      </div>
    </div>
  );
};

export default SignOut;
