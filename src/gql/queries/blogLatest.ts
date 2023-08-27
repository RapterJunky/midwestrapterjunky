const QueryBlogLatest = `
query QueryBlogLatest($first: IntType = "5") {
    site: _site {
        faviconMetaTags {
            attributes
            content
            tag
        }
    }
    posts: allArticles(first: $first, orderBy: _firstPublishedAt_DESC) {
        tags
        title
        slug
        seo: _seoMetaTags {
            attributes
            content
            tag
        }
        publishedAt: _publishedAt
    }
}
`;
export default QueryBlogLatest;
