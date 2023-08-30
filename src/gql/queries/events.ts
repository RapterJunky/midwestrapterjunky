const EventsQuery = `
    query GetEvents {
        allEvents(orderBy: dateFrom_DESC) {
            id
            slug
        }
    }
`;
export default EventsQuery;
