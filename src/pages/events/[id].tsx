import type {
  GetStaticPropsContext,
  GetStaticPropsResult,
  GetStaticPathsResult,
  NextPage,
} from "next";
import {
  StructuredText,
  type StructuredTextGraphQlResponse,
} from "react-datocms/structured-text";
import type { SeoOrFaviconTag } from "react-datocms";
import Script from "next/script";
import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import { z } from "zod";

import StoreButtonLink from "@/components/ui/StoreButtonLink";
import HiArrowLeft from "@components/icons/HiArrowLeft";
import ScrollToTop from "@components/blog/ScrollToTop";
import ExitPreview from "@/components/ui/ExitPreview";
import Footer from "@components/layout/Footer";
import Navbar from "@components/layout/Navbar";
import IconLink from "@/components/ui/IconLink";
import SiteTags from "@components/SiteTags";

import { markRules } from "@lib/structuredTextRules";
import EventPageQuery from "@query/queries/event";
import EventsQuery from "@query/queries/events";
import { logger } from "@lib/logger";
import { DatoCMS } from "@api/gql";

import type { ResponsiveImage, LinkWithIcon, FullPageProps } from "types/page";

import { fetchCacheData } from "@lib/cache";

declare const L: {
  map: (
    el: string,
    opt?: { center?: [number, number]; zoom?: number }
  ) => { setView: (view: [number, number], zoom: number) => void };
  tileLayer: (
    url: string,
    opt?: { maxZoom?: number; attribution?: string }
  ) => { addTo: (map: object) => void };
  marker: (lat: [number, number]) => { addTo: (map: object) => void };
};

interface EventPageProps extends FullPageProps {
  event: {
    _seoMetaTags: SeoOrFaviconTag[];
    updatedAt: string;
    dateTo: string;
    dateFrom: string;
    title: string;
    id: string;
    slug: string;
    extraLocationDetails: string | null;
    description: StructuredTextGraphQlResponse;
    links: LinkWithIcon[];
    gallery: ResponsiveImage[];
    location: {
      latitude: number;
      longitude: number;
    } | null;
    shopItemLink: null | { value: string };
  };
}

const PAGE_CACHE_KEY = "event-pages";
const schema = z.string();

const loadPages = async () => {
  const data = await DatoCMS<{
    allEvents: { id: string; slug: string }[];
  }>({ query: EventsQuery });
  return data.allEvents.map((value) => value.slug);
};

const getPage = async (id = "", draft = false) => {
  logger.info(`Event page (${id}) - preview(${draft}) | Generating`);
  const data = await DatoCMS<EventPageProps>(
    {
      query: EventPageQuery,
      variables: {
        eq: id,
      },
    },
    {
      draft,
    }
  );
  return {
    ...data,
    preview: draft,
  };
};

export const getStaticProps = async (
  ctx: GetStaticPropsContext
): Promise<GetStaticPropsResult<EventPageProps>> => {
  const check = schema.safeParse(ctx.params?.id);
  if (!check.success)
    return {
      notFound: true,
    };

  const id = check.data;

  if (ctx.draftMode || ctx.preview) {
    const data = await getPage(id, true);
    return {
      props: data,
    };
  }

  const pages = await fetchCacheData<string[]>(PAGE_CACHE_KEY, loadPages);

  if (!pages.includes(id))
    return {
      notFound: true,
    };

  const data = await getPage(id, false);

  return {
    props: data,
  };
};

export async function getStaticPaths(): Promise<
  GetStaticPathsResult<{ id: string }>
> {
  await fetchCacheData(PAGE_CACHE_KEY, loadPages, true);

  return {
    paths: [],
    fallback: "blocking",
  };
}
// {props.shoptItem ? <Button href={props.shoptItem} link>VIEW SHOP</Button> : null }
//https://wiki.openstreetmap.org/wiki/Export#Embeddable_HTML
const EventPage: NextPage<EventPageProps> = ({
  _site,
  preview,
  event,
  navbar,
}) => {
  return (
    <div className="flex h-full flex-col">
      <SiteTags
        tags={[
          event._seoMetaTags,
          _site.faviconMetaTags,
          [
            {
              tag: "meta",
              attributes: {
                property: "og:url",
                content: `https://midwestraptorjunkies.com/events/${event.id}`,
              },
            },
          ],
        ]}
      />
      <Navbar {...navbar} mode="none" />
      <main className="mx-auto max-w-3xl flex-grow px-4 sm:px-6 xl:max-w-5xl xl:px-0">
        <ScrollToTop comments={false} />
        <article>
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
                  <div className="mb-3 text-center">
                    No details where provided.
                  </div>
                ) : null}

                {event.location || event.extraLocationDetails ? (
                  <section className="flex w-full flex-col py-4">
                    <h3 className="text-sm font-bold">Location Details</h3>
                    {event.extraLocationDetails ? (
                      <p className="my-2 text-gray-500">
                        {event.extraLocationDetails}
                      </p>
                    ) : null}
                    {event.location ? (
                      <>
                        <Head>
                          {/* NextJS gets mad about this, but theres no reason to load this when the page does not need it and we arnt using app dir. */}
                          <link
                            rel="stylesheet"
                            href="https://unpkg.com/leaflet@1.9.3/dist/leaflet.css"
                            crossOrigin=""
                            integrity="sha256-kLaT2GOSpHechhsozzB+flnD+zUyjE2LlfWPgU04xyI="
                          />
                        </Head>
                        <div id="map" className="h-80"></div>
                        <Script
                          onReady={() => {
                            const cord: [number, number] = [
                              event.location?.latitude as number,
                              event.location?.longitude as number,
                            ];
                            const map = L.map("map", {
                              center: cord,
                              zoom: 15,
                            });
                            L.tileLayer(
                              "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                              {
                                attribution:
                                  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                              }
                            ).addTo(map);
                            L.marker(cord).addTo(map);
                          }}
                          crossOrigin=""
                          strategy="lazyOnload"
                          src="https://unpkg.com/leaflet@1.9.3/dist/leaflet.js"
                          integrity="sha256-WBkoXOwTeyKclOHuWtc+i2uENFpDZ9YPdf5Hf+D7ewM="
                        />
                      </>
                    ) : null}
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
                    <hr />
                    <ul className="ml-3">
                      {event.links.map((value, i) => (
                        <li key={i} className="p-1">
                          <IconLink
                            {...value}
                            className="flex items-center gap-1 text-blue-500 underline hover:text-blue-600"
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <div className="pt-4 xl:pt-8">
                  <Link
                    href="/calendar"
                    className="flex items-center gap-1 text-blue-500 hover:text-blue-600"
                  >
                    <HiArrowLeft /> Back to the calendar
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </article>
      </main>
      <Footer />
      {preview ? <ExitPreview /> : null}
    </div>
  );
};
export default EventPage;
