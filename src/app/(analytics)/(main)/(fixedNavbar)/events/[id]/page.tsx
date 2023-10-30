import { StructuredText } from "react-datocms/structured-text";
import type { Metadata, ResolvingMetadata } from "next";
import { ArrowLeft } from "lucide-react";
import type { Event } from "schema-dts";
import Script from "next/script";
import Image from "next/image";
import Link from "next/link";

import {
  markRules,
  renderBlock,
  renderInlineRecord,
} from "@/lib/structuredTextRules";
import EventPageQuery, { type EventPageQueryResult } from "@/gql/queries/event";
import StoreButtonLink from "@/components/pages/events/StoreButtonLink";
import { getDescriptionTag } from "@/lib/utils/description";
import LeafMaps from "@/components/pages/events/LeafMaps";
import ScrollToTop from "@/components/blog/ScrollToTop";
import getPageQuery from "@/lib/services/GetPageQuery";
import { Separator } from "@/components/ui/separator";
import getSeoTags from "@/lib/helpers/getSeoTags";
import IconLink from "@/components/ui/IconLink";
import { Button } from "@/components/ui/button";
import { host } from "@/lib/utils/host";

type PageParams = { params: { id: string } };

export async function generateMetadata(
  { params }: PageParams,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { event } = await getPageQuery<EventPageQueryResult>(EventPageQuery, {
    variables: {
      eq: params.id,
    },
  });

  return getSeoTags({
    parent,
    datocms: event.seo,
    slug: `/events/${params.id}`,
    metadata: {
      openGraph: {
        url: `${host}/events/${params.id}`,
      },
    },
  });
}

const EventPage: React.FC<PageParams> = async ({ params }) => {
  const { event } = await getPageQuery<EventPageQueryResult>(EventPageQuery, {
    variables: { eq: params.id },
  });

  const jsonld: Event = {
    "@type": "Event",
    endDate: event.dateTo,
    startDate: event.dateFrom,
    eventAttendanceMode: "OfflineEventAttendanceMode",
    description: getDescriptionTag(event.seo),
    location: event.extraLocationDetails ?? undefined,
    image: event.gallery.at(0)?.responsiveImage.src,
  };

  return (
    <article className="mx-auto max-w-3xl flex-grow px-4 sm:px-6 xl:max-w-5xl xl:px-0">
      <ScrollToTop comments={false} />
      <Script type="application/ld+json" id={`jsonld-${event.id}`}>
        {JSON.stringify(jsonld)}
      </Script>
      <div className="xl:divide-y xl:divide-gray-200">
        <header className="pt-6 xl:pb-6">
          <div className="space-y-1 text-center">
            <div>
              <h1 className="md:leading-14 text-3xl font-extrabold leading-9 tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-5xl">
                {event.title}
              </h1>
            </div>
          </div>
        </header>
        <div
          className="divide-y divide-gray-200 pb-8 xl:grid xl:grid-cols-4 xl:gap-x-6 xl:divide-y-0"
          style={{ gridTemplateRows: "auto 1fr" }}
        >
          <div className="divide-y divide-gray-200 xl:col-span-3 xl:row-span-2 xl:pb-0">
            <div className="prose max-w-none pb-8 pt-10">
              <StructuredText
                renderBlock={renderBlock}
                renderInlineRecord={renderInlineRecord}
                data={event.description}
                customMarkRules={markRules}
              />
            </div>
            {event.gallery && event.gallery.length > 0 ? (
              <section className="flex flex-col items-center justify-center gap-2">
                <div className="flex w-full flex-col justify-start p-2">
                  <h2 className="font-bold">Image Gallery</h2>
                </div>
                <div className="container mb-4 flex max-w-none flex-wrap gap-2 px-4">
                  {event.gallery.map((value, i) => (
                    <div key={i} className="relative h-40 w-40">
                      <Image
                        fill
                        blurDataURL={value.blurUpThumb}
                        placeholder={
                          value.blurUpThumb.length ? "blur" : "empty"
                        }
                        sizes={value.responsiveImage.sizes}
                        alt={value.responsiveImage?.alt ?? ""}
                        className="block h-full w-full rounded-lg object-cover object-center"
                        src={value.responsiveImage.src}
                      />
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
          <div className="divide-gray-200 text-sm font-medium leading-5 xl:col-start-1 xl:row-start-2 xl:divide-y">
            <div className="w-full py-4">
              <h2 className="mb-1 text-base font-bold">Event Details</h2>
            </div>
            {!event?.shopItemLink &&
              !(event.location || event.extraLocationDetails) &&
              (!event.links || event.links.length === 0) ? (
              <div className="mb-3 text-center">No details where provided.</div>
            ) : null}

            {event.location || event.extraLocationDetails ? (
              <section className="flex w-full flex-col py-4">
                <h3 className="text-sm font-bold">Location Details</h3>
                {event.extraLocationDetails ? (
                  <p className="my-2 text-gray-500">
                    {event.extraLocationDetails}
                  </p>
                ) : null}
                {event.location ? <LeafMaps location={event.location} /> : null}
              </section>
            ) : null}
            {event?.shopItemLink ? (
              <div className="w-full py-4">
                <StoreButtonLink {...event.shopItemLink} />
              </div>
            ) : null}
            {event.links && event.links.length > 0 ? (
              <div className="w-full py-4">
                <h3 className="text-base font-bold">Links</h3>
                <Separator className="my-2" />
                <ul className="space-y-1">
                  {event.links.map((value, i) => (
                    <li key={i}>
                      <IconLink
                        {...value}
                        className="w-full justify-start hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className="pt-4 xl:pt-8">
              <Button asChild variant="secondary">
                <Link href="/calendar">
                  <ArrowLeft /> Back to Calendar
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Script type="application/ld+json" id={`jsonld-${event.slug}`}>
        {JSON.stringify({
          "@context": "https://www.schema.org",
          location: event.extraLocationDetails
            ? {
              "@type": "Place",
              name: event.extraLocationDetails,
            }
            : undefined,
          "@type": "Event",
          name: event.title,
          startDate: event.dateFrom,
          endDate: event.dateTo,
          description: getDescriptionTag(event.seo),
          url: `${process.env.VERCEL_ENV === "development" ? "http" : "https"
            }://${process.env.VERCEL_URL}/events/${event.slug}`,
        })}
      </Script>
    </article>
  );
};
export default EventPage;
