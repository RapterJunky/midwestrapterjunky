import { toNextMetadata, type Metadata, type SeoOrFaviconTag } from "react-datocms/seo";
import getPageQuery from "@/lib/cache/GetPageQuery";
import type { FullPageProps } from "@/types/page";
import CalendarQuery from '@query/queries/calendar';
import { REVAILDATE_IN_12H } from "@lib/revaildateTimings";
import Calendar from "@/components/Calendar";

interface Props extends FullPageProps {
    events: {
        id: string;
        slug: string;
        title: string;
        dateFrom: string;
        dateTo: string;
    }[];
    calendar: {
        seo: SeoOrFaviconTag[];
    };
}

const MAX_FETCH = 8;


export async function generateMetadata(): Promise<Metadata> {
    const { calendar, site } = await getPageQuery<Props>(CalendarQuery, {
        variables: {
            first: MAX_FETCH,
            date: new Date().toISOString()
        },
        revalidate: REVAILDATE_IN_12H
    });
    return toNextMetadata([...site.faviconMetaTags, ...calendar.seo])
}

const Page: React.FC = async () => {
    const { events } = await getPageQuery<Props>(CalendarQuery, {
        variables: {
            first: MAX_FETCH,
            date: new Date().toISOString()
        },
        revalidate: REVAILDATE_IN_12H
    });
    return (
        <Calendar data={events} />
    );
}
export default Page;