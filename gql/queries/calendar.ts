import Navbar from '../fragments/Navbar';
export default `
    query CalendarQuery($date: DateTime, $first: IntType) {
        _site {
            faviconMetaTags {
              attributes
              content
              tag
            }
        }
        calendar {
            _seoMetaTags {
              attributes
              content
              tag
            }
          }
        navbar {
            ...NavbarRecordFragment
        }
        allEvents(filter: { dateFrom: { gt: $date } }, first: $first, orderBy: dateFrom_ASC) {
            id
            dateTo
            dateFrom
            title
            slug
        }
    }
${Navbar}
`;