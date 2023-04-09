import type {
  GetStaticPropsContext,
  GetStaticPropsResult,
  NextPage,
} from "next";
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
    dateFrom: string;
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
      date: currDate.toISOString(),
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

const CalendarPage: NextPage<CalendarProps> = ({
  _site,
  calendar,
  navbar,
  allEvents,
  preview,
}) => {
  return (
    <div className="flex flex-col">
      <SiteTags tags={[_site.faviconMetaTags, calendar._seoMetaTags]} />
      <header>
        <Navbar {...navbar} mode="none" />
      </header>
      <main className="flex h-full flex-1 flex-col">
        <Calendar data={allEvents} />
      </main>
      <Footer />
      {preview ? <ExitPreview /> : null}
    </div>
  );
};

export default CalendarPage;
