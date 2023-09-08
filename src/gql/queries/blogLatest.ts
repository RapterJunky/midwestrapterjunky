import type { SeoOrFaviconTag } from "react-datocms/seo";

export type BlogLatestQueryResult = {
  seo: SeoOrFaviconTag[];
  posts: {
    slug: string;
    publishedAt: string | null;
    title: string;
    seo: SeoOrFaviconTag[];
    tags: string[];
  }[];
};

const QueryBlogLatest = `
query QueryBlogLatest($first: IntType = "5") {
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
