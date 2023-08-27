const CalendarQuery = `
    query CalendarQuery($date: DateTime, $first: IntType) {
        site: _site {
            faviconMetaTags {
              attributes
              content
              tag
            }
        }
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
