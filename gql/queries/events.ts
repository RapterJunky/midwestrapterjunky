export default `
    query GetEvents {
        allEvents(orderBy: dateFrom_DESC) {
            id
            slug
        }
    }
`;