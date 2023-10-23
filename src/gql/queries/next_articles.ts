const GetNextArticles = `
    query MyQuery($date: DateTime, $id: ItemId) {
        next: article(filter: {hiddenArticle: { eq: false }, id: {neq: $id}, _publishedAt: {gt: $date}}, orderBy: _publishedAt_ASC) {
            slug
            title
        }
        prev: article(filter: {hiddenArticle: { eq: false }, id: {neq: $id}, _publishedAt: {lt: $date}}, orderBy: _publishedAt_DESC) {
            slug
            title
        }
    }
`;

export default GetNextArticles;
