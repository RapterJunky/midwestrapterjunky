import type { NextPage } from "next";
import { useRouter } from "next/router";

import Navbar from "@components/layout/Navbar";
import Footer from "@components/layout/Footer";
import SiteTags from "@components/SiteTags";

import { DatoCMS } from "@api/gql";
import Query from "@query/queries/generic";
import type { FullPageProps } from "types/page";
import { fetchCacheData } from "@lib/cache";

export async function getStaticProps() {
  const data = await fetchCacheData<FullPageProps>("GenericPage", () => DatoCMS(Query));

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
            { tag: "title", content: "Submited - Midwest Raptor Junkies" },
            {
              tag: "meta",
              attributes: { name: "robots", content: "noindex,nofollow" },
            },
          ],
        ]}
      />
      <Navbar mode="none" {...navbar} />
      <main className="flex flex-1 items-center justify-center">
        <div className="prose md:prose-lg text-center">
          {router.query.ok === "true" ? (
            <>
              <h1 className="p-2 text-4xl font-bold">Thank you.</h1>
              <p className="font-serif text-2xl font-medium">
                Your email was add to the mailing list.
              </p>
            </>
          ) : (
            <>
              <h1>There was an issue!</h1>
              <p>
                {router.query?.error ??
                  "Was not able to add your email to the mailing list."}
              </p>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Submited;
