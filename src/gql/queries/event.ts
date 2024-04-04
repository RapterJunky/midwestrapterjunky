import ImageHelper from "../fragments/ImageHelper";
import type { SeoOrFaviconTag } from "react-datocms/seo";
import type { StructuredTextGraphQlResponse } from "react-datocms/structured-text";
import type { LinkWithIcon, ResponsiveImage } from "@/types/page";

export type EventPageQueryResult = {
  event: {
    seo: SeoOrFaviconTag[];
    updatedAt: string;
    dateTo: string;
    dateFrom: string;
    title: string;
    id: string;
    slug: string;
    extraLocationDetails: string | null;
    description: StructuredTextGraphQlResponse<
      {
        __typename: string;
        id: string;
        content: ResponsiveImage<{ width: number; height: number }>;
      },
      { title: string; slug: string; __typename: string; id: string }
    >;
    links: LinkWithIcon[];
    gallery: ResponsiveImage[];
    location: {
      latitude: number;
      longitude: number;
    } | null;
    shopItemLink: null | { value: string };
  };
};

const EventPageQuery = `
    query GetEvent($eq: String = "") {
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
