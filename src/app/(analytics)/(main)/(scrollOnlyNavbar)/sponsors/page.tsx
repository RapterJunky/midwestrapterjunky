import type { Metadata, ResolvingMetadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Card, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import SponsorsQuery, { type SponsorsQueryResult, } from "@/gql/queries/sponsors";
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
    });
  } catch (e) {
    return getSeoTags({
      parent,
      metadata: {
        title: "Error"
      }
    });
  }
}

const Sponsors: React.FC = async () => {
  const { sponsor } = await getPageQuery<SponsorsQueryResult>(SponsorsQuery);
  return (
    <div className="mb-4 flex w-full flex-grow flex-col items-center gap-6 divide-y divide-zinc-300">
      <h1 className="md:leading-14 my-4 text-3xl font-extrabold leading-9 tracking-tight text-zinc-900 sm:text-4xl sm:leading-10 md:text-5xl mt-28">
        Our Sponsors
      </h1>
      <section className="grid w-full max-w-7xl grid-cols-1 gap-8 px-4 pt-4 md:grid-cols-2 lg:grid-cols-3 md:px-0">
        {sponsor.sponsors.map((value, i) => (
          <Link href={value.link ?? "/"} key={value.id}>
            <Card key={value.id} className="rounded-sm shadow flex flex-col h-full">
              <div className="flex h-48 w-full items-center justify-center bg-zinc-200 p-2 hover:bg-zinc-300 flex-shrink">
                <div className="relative h-3/4 w-3/4">
                  <Image
                    className="object-contain object-center"
                    src={value.logo.responsiveImage.src}
                    alt={value.logo.responsiveImage.alt ?? value.sponsorName}
                    sizes={value.logo.responsiveImage.sizes}
                    fill
                  />
                </div>
              </div>
              {i % 2 === 0 && value.description ? (
                <CardContent className="p-4 pt-3">
                  <CardDescription>
                    {value.description}
                  </CardDescription>
                </CardContent>
              ) : null}
              <CardFooter className="flex justify-end items-end p-4 pb-3 flex-grow">
                <Button size="sm" variant="secondary">View more</Button>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  );
};

export default Sponsors;
