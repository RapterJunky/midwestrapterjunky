import type { SeoOrFaviconTag } from "react-datocms/seo";
import { useRouter } from "next/router";
import type { NextPage } from "next";
import Link from "next/link";

import genericSeoTags from "@lib/utils/genericSeoTags";
import Navbar from "@components/layout/OldNavbar";
import type { FullPageProps } from "types/page";
import Footer from "@components/layout/Footer";
import { fetchCachedQuery } from "@lib/cache";
import SiteTags from "@components/SiteTags";
import Query from "@query/queries/generic";

interface Props extends FullPageProps {
  seo: SeoOrFaviconTag[];
}

export async function getStaticProps() {
  const data = await fetchCachedQuery<FullPageProps>("GenericPage", Query);
  return {
    props: {
      ...data,
      preview: false,
      seo: genericSeoTags({
        title: "Confirmation",
        robots: false,
        description: "Confirmation page",
      }),
    },
  };
}

const Submited: NextPage<Props> = ({ _site, navbar, seo }) => {
  const router = useRouter();

  const shop_receipt_url = decodeURIComponent(
    (Array.isArray(router.query.shop_receipt)
      ? router.query.shop_receipt[0]
      : router.query.shop_receipt) ?? "",
  );

  return (
    <div className="flex h-full flex-col">
      <SiteTags tags={[_site.faviconMetaTags, seo]} />
      <Navbar mode="none" {...navbar} />
      <main className="flex flex-1 items-center justify-center">
        <div className="prose text-center md:prose-lg">
          {router.query.status === "ok" ? (
            router.query.mode === "email" ? (
              <>
                <h1 className="p-2 text-4xl font-bold">Thank you.</h1>
                <p className="text-2xl font-medium">
                  {router.query.message ?? ""}
                </p>
              </>
            ) : (
              <>
                <h1 className="p-2 text-4xl font-bold">
                  Thank you for your purchase.
                </h1>
                <p className="text-2xl font-medium">
                  Your receipt ID:{" "}
                  <span className="text-neutral-400">
                    {router.query.shop_receipt_id}
                  </span>
                </p>
                {router.query.shop_receipt &&
                (shop_receipt_url.startsWith(
                  "https://squareupsandbox.com/receipt",
                ) ||
                  shop_receipt_url.startsWith(
                    "https://squareup.com/receipt",
                  )) ? (
                  <Link
                    className="text-primary hover:text-primary-500"
                    target="_blank"
                    rel="noopener"
                    href={shop_receipt_url}
                  >
                    View Receipt
                  </Link>
                ) : null}
              </>
            )
          ) : (
            <>
              <h1>There was an issue!</h1>
              <p>
                {router.query?.message ??
                  "There was an error processing your request."}
              </p>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Submited;
