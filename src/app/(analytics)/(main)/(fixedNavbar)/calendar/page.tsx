import type { Metadata, ResolvingMetadata } from "next";
import Calendar from "@/components/Calendar";
import getSeoTags from "@/lib/helpers/getSeoTags";
import getPageQuery from "@/lib/services/GetPageQuery";
import { REVAILDATE_IN_12H } from "@lib/revaildateTimings";
import CalendarQuery, {
  type CalendarQueryResult,
} from "@query/queries/calendar";

const MAX_FETCH = 8;

export async function generateMetadata(
  {},
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { calendar } = await getPageQuery<CalendarQueryResult>(CalendarQuery, {
    variables: {
      first: MAX_FETCH,
      date: new Date().toISOString(),
    },
    revalidate: {
      revalidate: REVAILDATE_IN_12H,
    },
  });

  return getSeoTags({
    parent,
    slug: "/calendar",
    datocms: calendar.seo,
  });
}

const Page: React.FC = async () => {
  const { events } = await getPageQuery<CalendarQueryResult>(CalendarQuery, {
    variables: {
      first: MAX_FETCH,
      date: new Date().toISOString(),
    },
    revalidate: {
      revalidate: REVAILDATE_IN_12H,
    },
  });
  return <Calendar data={events} />;
};
export default Page;
