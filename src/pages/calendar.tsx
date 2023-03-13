import type { GetStaticPropsContext, GetStaticPropsResult } from "next";
import type { SeoOrFaviconTag } from "react-datocms";

import Footer from "@components/layout/Footer";
import Navbar from "@components/layout/Navbar";
import Calendar from "@components/Calendar";
import ExitPreview from "@components/ExitPreview";
import SiteTags from "@components/SiteTags";

import { REVAILDATE_IN_12H } from "@lib/revaildateTimings";
import { DatoCMS } from "@api/gql";
import Query from "@query/queries/calendar";

import type { FullPageProps } from "types/page";

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

const MAX_FETCH = 8;

export const getStaticProps = async (
  ctx: GetStaticPropsContext
): Promise<GetStaticPropsResult<CalendarProps>> => {
  const currDate = new Date();
  currDate.setMonth(currDate.getMonth() - 1);

  const data = await DatoCMS<CalendarProps>(Query, {
    preview: ctx.preview,
    variables: {
      first: MAX_FETCH,
      date: currDate.toISOString(), // moment().subtract(1, "months").toISOString(),
    },
  });

  return {
    props: {
      ...data,
      preview: ctx?.preview ?? false,
    },
    revalidate: REVAILDATE_IN_12H,
  };
};

export default function CalendarPage(props: CalendarProps) {
  return (
    <div className="flex h-full flex-col">
      <SiteTags
        tags={[props._site.faviconMetaTags, props.calendar._seoMetaTags]}
      />
      <header>
        <Navbar {...props.navbar} mode="none" />
      </header>
      <main className="flex h-full flex-col">
        <Calendar data={props.allEvents} />
      </main>
      <Footer />
      {props.preview ? <ExitPreview /> : null}
    </div>
  );
}
