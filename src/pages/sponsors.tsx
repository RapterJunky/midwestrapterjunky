import type {
  GetStaticPropsContext,
  GetStaticPropsResult,
  NextPage,
} from "next";
import type { SeoOrFaviconTag } from "react-datocms";
import Link from "next/link";
import Image from "next/image";

import Footer from "@components/layout/Footer";
import Navbar from "@components/layout/Navbar";
import SiteTags from "@components/SiteTags";
import ExitPreview from "@/components/ui/ExitPreview";

import type { FullPageProps, ResponsiveImage } from "types/page";
import SponsorsQuery from "@query/queries/sponsors";
import { DatoCMS } from "@api/gql";

interface PageProps extends FullPageProps {
  sponsor: {
    seo: SeoOrFaviconTag[];
    sponsors: {
      link: string | null;
      sponsorName: string;
      id: string;
      logo: ResponsiveImage;
    }[];
  };
}

export const getStaticProps = async (
  ctx: GetStaticPropsContext
): Promise<GetStaticPropsResult<PageProps>> => {
  const data = await DatoCMS<PageProps>(SponsorsQuery, {
    preview: ctx.preview,
  });

  return {
    props: {
      ...data,
      preview: ctx?.preview ?? false,
    },
  };
};

const SponsorsPage: NextPage<PageProps> = ({
  preview,
  _site,
  navbar,
  sponsor,
}) => {
  return (
    <div className="flex h-full flex-col">
      <SiteTags tags={[_site.faviconMetaTags, sponsor.seo]} />
      <Navbar {...navbar} mode="none" />
      <main className="mb-4 flex w-full flex-grow flex-col items-center justify-center gap-6 divide-y divide-gray-300">
        <h1 className="md:leading-14 my-4 text-3xl font-extrabold leading-9 tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-5xl">
          Our Sponsors
        </h1>
        <section className="grid w-full max-w-7xl grid-cols-1 gap-8 px-4 pt-4 sm:grid-cols-2 md:grid-cols-3 md:px-0">
          {sponsor.sponsors.map((value) => (
            <Link
              key={value.id}
              href={value.link ?? ""}
              className="flex h-48 w-full items-center justify-center rounded-sm bg-gray-200 p-2 hover:bg-gray-300"
            >
              <div className="relative h-20 w-20">
                <Image
                  className="object-cover object-center"
                  src={value.logo.responsiveImage.src}
                  alt={value.logo.responsiveImage.alt ?? value.sponsorName}
                  sizes={value.logo.responsiveImage.sizes}
                  fill
                />
              </div>
            </Link>
          ))}
        </section>
      </main>
      <Footer />
      {preview ? <ExitPreview /> : null}
    </div>
  );
};

export default SponsorsPage;
