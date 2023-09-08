import type { Metadata, ResolvingMetadata } from "next";
import Image from "next/image";
import Link from "next/link";

import getPageQuery from "@/lib/services/GetPageQuery";
import SponsorsQuery, {
  type SponsorsQueryResult,
} from "@/gql/queries/sponsors";
import { Button } from "@/components/ui/button";
import getSeoTags from "@/lib/helpers/getSeoTags";

export async function generateMetadata(
  {},
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { sponsor } = await getPageQuery<SponsorsQueryResult>(SponsorsQuery);
  return getSeoTags({
    parent,
    datocms: sponsor.seo,
  });
}

const Sponsors: React.FC = async () => {
  const { sponsor } = await getPageQuery<SponsorsQueryResult>(SponsorsQuery);
  return (
    <div className="mb-4 flex w-full flex-grow flex-col items-center justify-center gap-6 divide-y divide-gray-300">
      <h1 className="md:leading-14 my-4 text-3xl font-extrabold leading-9 tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-5xl">
        Our Sponsors
      </h1>
      <section className="grid w-full max-w-7xl grid-cols-1 gap-8 px-4 pt-4 sm:grid-cols-2 md:grid-cols-3 md:px-0">
        {sponsor.sponsors.map((value) => (
          <Button asChild key={value.id} variant="ghost">
            <Link
              href={value.link ?? "/"}
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
          </Button>
        ))}
      </section>
    </div>
  );
};

export default Sponsors;
