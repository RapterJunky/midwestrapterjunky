import type { SeoOrFaviconTag } from "react-datocms/seo";

export type CalendarQueryResult = {
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
};

const CalendarQuery = `
    query CalendarQuery($date: DateTime, $first: IntType) {
        calendar {
            seo: _seoMetaTags {
              attributes
              content
              tag
            }
          }
        events: allEvents(filter: { dateFrom: { gt: $date } }, first: $first, orderBy: dateFrom_ASC) {
            id
            dateTo
            dateFrom
            title
            slug
        }
    }
`;
export default CalendarQuery;
