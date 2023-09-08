import type { StructuredTextGraphQlResponse } from "react-datocms/structured-text";
import type { SeoOrFaviconTag } from "react-datocms/seo";
import type { ResponsiveImage } from "@/types/page";
import ImageHelper from "../fragments/ImageHelper";

export type ArticleQueryResult = {
  post: {
    title: string;
    content: StructuredTextGraphQlResponse<
      {
        __typename: string;
        id: string;
        content: ResponsiveImage<{ width: number; height: number }>;
      },
      { title: string; slug: string; __typename: string; id: string }
    >;
    publishedAt: string;
    authors: {
      avatar: string | null;
      name: string;
      social: {
        user: string;
        link: string;
      } | null;
    }[];
    seo: SeoOrFaviconTag[];
    slug: string;
    tags: string[];
    id: string;
  };
};

const ArticleQuery = `
query ArticlePageQuery($slug: String = "") {
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
}`;

export default ArticleQuery;
