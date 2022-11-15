import Navbar from "../fragments/Navbar";
export default `
    query GetEvent($eq: ItemId = "") {
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
        event(filter: {id: {eq: $eq}}) {
            dateTo
            dateFrom
            updatedAt
            title
            shopItem
            location {
                latitude
                longitude
            }
            links {
                link
                title
            }
            id
            description {
                blocks
                links
                value
            }
            gallery {
                url
                alt
            }
            _seoMetaTags {
                attributes
                content
                tag
            }
        }
    }
${Navbar}
`;