import Navbar from '../fragments/Navbar';
export default `
    query CalendarQuery($first: IntType = "5") {
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
        allEvents(first: $first) {
            id
            dateTo
            dateFrom
            title
        }
    }
${Navbar}
`;