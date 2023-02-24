import type { GetStaticPropsContext } from "next";
import { useRouter } from "next/router";
import ExitPreview from "@components/ExitPreview";
import Footer from "@components/Footer";
import SiteTags from "@components/SiteTags";

import { DatoCMS } from "@api/gql";
import Query from "@query/queries/generic";
import Navbar from "@components/Navbar";
import type { FullPageProps } from "@type/page";

export async function getStaticProps(ctx: GetStaticPropsContext) {
  const data = await DatoCMS(Query, {
    preview: ctx.preview,
  });

  return {
    props: {
      ...data,
      preview: ctx.preview ?? false,
    },
  };
}

export default function Submited(props: FullPageProps) {
  const router = useRouter();

  return (
    <div className="flex h-full flex-col">
      <SiteTags
        tags={[
          props._site.faviconMetaTags,
          [
            { tag: "title", content: "Submited - Midwest Raptor Junkies" },
            {
              tag: "meta",
              attributes: { name: "robots", content: "noindex,nofollow" },
            },
          ],
        ]}
      />
      <Navbar mode="none" {...props.navbar} />
      <main className="flex flex-grow flex-col items-center justify-center">
        {router.query.ok === "true" ? (
          <>
            <h1 className="p-2 text-4xl font-bold">Thank you.</h1>
            <p className="font-serif text-2xl font-medium">
              Your email was add to the mailing list.
            </p>
          </>
        ) : (
          <>
            <h1 className="p-2 text-4xl font-bold">There was an issue!</h1>
            <p className="font-serif text-2xl font-medium">
              {router.query?.error ??
                "Was not able to add your email to the mailing list."}
            </p>
          </>
        )}
      </main>
      <Footer />
      {props.preview ? <ExitPreview /> : null}
    </div>
  );
}
