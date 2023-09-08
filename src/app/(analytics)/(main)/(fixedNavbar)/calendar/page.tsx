import type { ResolvingMetadata, Metadata } from "next";

import CalendarQuery, {
  type CalendarQueryResult,
} from "@query/queries/calendar";
import { REVAILDATE_IN_12H } from "@lib/revaildateTimings";
import getPageQuery from "@/lib/services/GetPageQuery";
import getSeoTags from "@/lib/helpers/getSeoTags";
import Calendar from "@/components/Calendar";

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
