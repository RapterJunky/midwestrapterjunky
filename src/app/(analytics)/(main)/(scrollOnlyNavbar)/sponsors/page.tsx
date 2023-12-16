import type { Metadata, ResolvingMetadata } from "next";
import Image from "next/image";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import SponsorsQuery, {
  type SponsorsQueryResult,
} from "@/gql/queries/sponsors";
import getPageQuery from "@/lib/services/GetPageQuery";
import getSeoTags from "@/lib/helpers/getSeoTags";
import { Button } from "@/components/ui/button";

export async function generateMetadata(
  { },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  try {
    const { sponsor } = await getPageQuery<SponsorsQueryResult>(SponsorsQuery);
    return getSeoTags({
      parent,
      datocms: sponsor.seo,
      slug: "/sponsors",
    });
  } catch (e) {
    return getSeoTags({
      parent,
      metadata: {
        title: "Error",
      },
    });
  }
}

const Sponsors: React.FC = async () => {
  const { sponsor } = await getPageQuery<SponsorsQueryResult>(SponsorsQuery);
  return (
    <div className="mb-4 flex w-full flex-grow flex-col items-center gap-6 divide-y divide-zinc-300">
      <h1 className="md:leading-14 my-4 mt-28 text-3xl font-extrabold leading-9 tracking-tight text-zinc-900 sm:text-4xl sm:leading-10 md:text-5xl">
        Our Sponsors
      </h1>
      <section className="grid w-full max-w-7xl grid-cols-1 gap-8 px-4 pt-4 md:grid-cols-2 md:px-0 lg:grid-cols-3">
        {sponsor.sponsors.map((value) => (
          <Link className="ph-autocapture" href={value.link ?? "/"} key={value.id} data-ph-capture-attribute-sponsor-url={value.link ?? "/"}>
            <Card
              key={value.id}
              className="flex h-full flex-col rounded-sm shadow"
            >
              <div className="relative flex h-48 w-full flex-shrink items-center justify-center bg-zinc-200 p-2 hover:bg-zinc-300">
                <div className="relative h-full w-full">
                  <Image
                    className="object-contain object-center"
                    src={value.logo.responsiveImage.src}
                    alt={value.logo.responsiveImage.alt ?? value.sponsorName}
                    sizes={value.logo.responsiveImage.sizes}
                    fill
                  />
                </div>
              </div>
              {value.description ? (
                <CardContent className="p-4 pt-3">
                  <CardDescription>{value.description}</CardDescription>
                </CardContent>
              ) : null}
              {value.link ? (
                <CardFooter className="flex flex-grow items-end justify-end p-4 pb-3">
                  <Button size="sm" variant="secondary">
                    View more
                  </Button>
                </CardFooter>
              ) : null}
            </Card>
          </Link>
        ))}
      </section>
    </div>
  );
};

export default Sponsors;
