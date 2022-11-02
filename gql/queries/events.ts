export default `
    query GetEvents {
        allEvents(orderBy: _createdAt_DESC, first: "20") {
            id
        }
    }
`;