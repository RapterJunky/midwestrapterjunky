import Navbar from "../fragments/Navbar";
import ImageHelper from "../fragments/ImageHelper";
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
                blocks {
                    __typename
                    content ${ImageHelper("event")}
                    id
                  }
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
            gallery ${ImageHelper("event")}
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
/*
{
                responsiveImage {
                  sizes
                  alt
                  src
                }
                blurUpThumb
            }
*/
