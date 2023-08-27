import ImageHelper from "../fragments/ImageHelper";

const ArticleQuery = `
query ArticlePageQuery($slug: String = "") {
    site: _site {
        faviconMetaTags {
            attributes
            content
            tag
        }
    }
    post: article(filter: {slug: {eq: $slug}}) {
        seo: _seoMetaTags {
            attributes
            content
            tag
        }
        publishedAt: _publishedAt
        authors
        id
        content {
          value
          blocks {
            id
            __typename
            content ${ImageHelper("article")}
          }
          links {
            ... on ArticleRecord {
              id
              title 
              slug
              __typename
            }
            ... on EventRecord {
              id
              slug 
              title
              __typename
            }
          }
        }
        slug
        title
        tags
      }
}
`;

export default ArticleQuery;
/*
{
              responsiveImage {
                sizes
                src
                alt
                height
                width
              }
              blurUpThumb
            }
*/
