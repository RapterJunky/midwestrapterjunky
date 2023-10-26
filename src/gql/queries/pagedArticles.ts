import type { SeoOrFaviconTag } from "react-datocms/seo";

export type Post = {
  slug: string;
  title: string;
  id: string;
  publishedAt: string;
  tags: string[];
  seo: SeoOrFaviconTag[];
};

export type PagedArticlesQueryResult = {
  totalArticles: {
    count: number;
  };
  posts: Post[];
};

const PagedArticles = `
query PagedArticles($first: IntType = "5", $skip: IntType = "0") {
  totalArticles: _allArticlesMeta(filter: { hiddenArticle: { eq: false } }) {
      count
  }
  posts: allArticles(orderBy: _firstPublishedAt_DESC, skip: $skip, first: $first, filter: { hiddenArticle:{ eq: false } }) {
    slug
    title
    id
    tags
    seo: _seoMetaTags {
      attributes
      tag
    }
    publishedAt: _publishedAt
  }
}`;

export default PagedArticles;
