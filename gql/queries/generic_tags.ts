export default `
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