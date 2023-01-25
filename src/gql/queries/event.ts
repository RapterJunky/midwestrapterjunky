import Navbar from "../fragments/Navbar";
const EventPageQuery = `
    query GetEvent($eq: String = "") {
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
        event(filter: {slug: {eq: $eq}}) {
            _seoMetaTags {
                attributes
                content
                tag
            }
            updatedAt: _updatedAt
            dateTo
            dateFrom
            title
            id
            slug
            extraLocationDetails
            description {
                blocks
                links
                value
            }
            links {
                title
                link
                useIcon
                icon
                iconPosition
            }
            gallery {
                responsiveImage {
                  sizes
                  alt
                  src
                }
                blurUpThumb
            }
            location {
                latitude
                longitude
            }
            shopItemLink
        }
    }
${Navbar}
`;
export default EventPageQuery;