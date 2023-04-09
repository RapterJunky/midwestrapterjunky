import { useRouter } from "next/router";
import type { NextPage } from "next";

import Navbar from "@components/layout/Navbar";
import Footer from "@components/layout/Footer";
import SiteTags from "@components/SiteTags";

import type { FullPageProps } from "types/page";
import { fetchCachedQuery } from "@lib/cache";
import Query from "@query/queries/generic";
import Link from "next/link";

export async function getStaticProps() {
  const data = await fetchCachedQuery<FullPageProps>("GenericPage", Query);
  return {
    props: {
      ...data,
      preview: false,
    },
  };
}

const Submited: NextPage<FullPageProps> = ({ _site, navbar }) => {
  const router = useRouter();

  return (
    <div className="flex h-full flex-col">
      <SiteTags
        tags={[
          _site.faviconMetaTags,
          [
            { tag: "title", content: "Confirmation - Midwest Raptor Junkies" },
            {
              tag: "meta",
              attributes: { name: "robots", content: "noindex,nofollow" },
            },
          ],
        ]}
      />
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
                (router.query.shop_receipt as string)?.startsWith(
                  "https://squareup.com/receipt/"
                ) ? (
                  <Link
                    className="text-primary hover:text-primary-500"
                    href={router.query.shop_receipt as string}
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
