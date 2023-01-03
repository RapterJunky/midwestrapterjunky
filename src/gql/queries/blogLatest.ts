import Navbar from '../fragments/Navbar';

const QueryBlogLatest = `
query QueryBlogLatest($first: IntType = "5") {
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
    posts: allArticles(first: $first, orderBy: _publishedAt_DESC) {
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
${Navbar}
`;
export default QueryBlogLatest;

/*
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
posts: allArticles(first: $first, orderBy: _publishedAt_DESC) {
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

*/