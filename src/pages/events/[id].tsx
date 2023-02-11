import type {
  GetStaticPropsContext,
  GetStaticPropsResult,
  GetStaticPathsContext,
  GetStaticPathsResult,
} from "next";
import type { SeoOrFaviconTag } from "react-datocms";
import { StructuredText } from "react-datocms/structured-text";
import Image from "next/image";
import { z } from "zod";
import Link from "next/link";
import { HiArrowLeft } from "react-icons/hi";

import StoreButtonLink from "@components/StoreButtonLink";
import IconLink from "@components/IconLink";
import ExitPreview from "@components/ExitPreview";
import SiteTags from "@components/SiteTags";
import Footer from "@components/Footer";
import Navbar from "@components/Navbar";

import { logger } from "@lib/logger";
import { DatoCMS } from "@api/gql";

import EventPageQuery from "@query/queries/event";
import EventsQuery from "@query/queries/events";
import { markRules } from "@lib/StructuredTextRules";

import type {
  ResponsiveImage,
  StructuredContent,
  LinkWithIcon,
  FullPageProps,
} from "@type/page";

import { fetchCacheData } from "@lib/cache";
import ScrollToTop from "@components/blog/ScrollToTop";

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
    description: StructuredContent;
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
  }>(EventsQuery);
  return data.allEvents.map((value) => value.slug);
};

const getPage = async (id: string = "", preview: boolean = false) => {
  logger.info(`Event page (${id}) - preview(${preview}) | Generating`);
  const data = await DatoCMS<EventPageProps>(EventPageQuery, {
    variables: {
      eq: id,
    },
    preview,
  });
  return {
    ...data,
    preview,
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

  if (ctx.preview) {
    const data = await getPage(id, true);
    return {
      props: data,
    };
  }

  const pages = await fetchCacheData(PAGE_CACHE_KEY, loadPages);

  if (!(pages.data as string[]).includes(id))
    return {
      notFound: true,
    };

  const data = await getPage(id, false);

  return {
    props: data,
  };
};

export async function getStaticPaths(
  ctx: GetStaticPathsContext
): Promise<GetStaticPathsResult<{ id: string }>> {
  await fetchCacheData(PAGE_CACHE_KEY, loadPages, !!process.env?.CI);

  return {
    paths: [],
    fallback: "blocking",
  };
}
// {props.shoptItem ? <Button href={props.shoptItem} link>VIEW SHOP</Button> : null }
//https://wiki.openstreetmap.org/wiki/Export#Embeddable_HTML
export default function EventPage({
  _site,
  preview,
  event,
  navbar,
}: EventPageProps) {
  return (
    <div className="flex h-full flex-col">
      <SiteTags tags={[event._seoMetaTags, _site.faviconMetaTags]} />
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
                <div className="prose max-w-none pt-10 pb-8">
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
                      <iframe
                        title="Event Location"
                        className="w-full outline-none"
                        loading="lazy"
                        height={350}
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${event.location.longitude}%2C${event.location.latitude}&amp;layer=mapnik&amp;marker=39.91457919444492%2C-86.05805397033691`}
                      ></iframe>
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
                            className="flex items-center gap-1 text-blue-600 underline hover:text-blue-400"
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <div className="pt-4 xl:pt-8">
                  <Link
                    href="/calendar"
                    className="flex items-center gap-1 text-teal-500 hover:text-teal-600"
                  >
                    <HiArrowLeft /> Back to the calendar
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </article>
      </main>
      <div className="h-20">
        <Footer />
      </div>
      {preview ? <ExitPreview /> : null}
    </div>
  );
}
