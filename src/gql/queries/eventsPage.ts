import Navbar from '../fragments/Navbar';
const EventsPageQuery = `
query EventsPageQuery($first: IntType = "5") {
    _site {
        faviconMetaTags {
          attributes
          content
          tag
        }
    }
    navbar {
        ...NavbarRecordFragment
    }
    allEvents(first: $first, orderBy: dateFrom_DESC) {
      id
      dateTo
      dateFrom
      title
      description {
        blocks
        links
        value
      }
      updatedAt
    }
  }
${Navbar}
`;
export default EventsPageQuery;