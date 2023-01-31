import type { GetStaticPropsContext, GetStaticPropsResult } from "next";
import { type SeoOrFaviconTag } from "react-datocms";
import moment from "moment";

import Footer from "@components/Footer";
import Navbar from "@components/Navbar";
import { DATOCMS_Fetch } from "@lib/gql";
import Query from "@query/queries/calendar";
import Calendar from "@components/Calendar";
import ExitPreview from "@components/ExitPreview";
import SiteTags from "@components/SiteTags";
import type { FullPageProps } from "@lib/types";

interface CalendarProps extends FullPageProps {
  allEvents: {
    id: string;
    slug: string;
    title: string;
    dateForm: string;
    dateTo: string;
  }[];
  calendar: {
    _seoMetaTags: SeoOrFaviconTag[];
  };
}

export const getStaticProps = async (
  ctx: GetStaticPropsContext
): Promise<GetStaticPropsResult<CalendarProps>> => {
  const data = await DATOCMS_Fetch<CalendarProps>(Query, {
    preview: ctx.preview,
    variables: {
      first: 20,
      date: moment().subtract(1, "months").toISOString(),
    },
  });

  return {
    props: {
      ...data,
      preview: ctx?.preview ?? false,
    },
    // 12 hours
    revalidate: 43200,
  };
};

export default function CalendarPage(props: CalendarProps) {
  return (
    <div className="flex flex-col">
      <SiteTags
        tags={[props._site.faviconMetaTags, props.calendar._seoMetaTags]}
      />
      <header>
        <Navbar {...props.navbar} mode="none" />
      </header>
      <main className="flex flex-col">
        <Calendar data={props.allEvents} />
      </main>
      <Footer />
      {props.preview ? <ExitPreview /> : null}
    </div>
  );
}
