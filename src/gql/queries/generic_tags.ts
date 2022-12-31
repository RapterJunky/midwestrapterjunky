const SiteTagsQuery = `
query GenericPage {
    _site {
        faviconMetaTags {
            attributes
            content
            tag
        }
    }
}
`;
export default SiteTagsQuery;