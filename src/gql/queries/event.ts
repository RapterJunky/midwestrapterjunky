import ImageHelper from "../fragments/ImageHelper";
const EventPageQuery = `
    query GetEvent($eq: String = "") {
        site: _site {
            faviconMetaTags {
              attributes
              content
              tag
            }
        }
        event(filter: {slug: {eq: $eq}}) {
            seo: _seoMetaTags {
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
