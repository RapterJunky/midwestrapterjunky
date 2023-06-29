import Navbar from "../fragments/Navbar";

const ArticleQuery = `
query ArticlePageQuery($slug: String = "") {
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
            content {
              responsiveImage {
                sizes
                src
                alt
                height
                width
              }
              blurUpThumb
            }
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
${Navbar}
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
