import type { StructuredTextGraphQlResponse } from "react-datocms/structured-text";
import type { SeoOrFaviconTag } from "react-datocms/seo";

import EmailCallToActionFragment from "../fragments/EmailCallToAction";
import CustomHtmlSectionFragment from "../fragments/CustomHtmlSection";
import type { ModulerContent, ResponsiveImage } from "@/types/page";
import ImageHelper from "../fragments/ImageHelper";

export type AboutUsQueryResult = {
  aboutUsModel: {
    seo: SeoOrFaviconTag[];
    imageTitle: string;
    title: string;
    content: StructuredTextGraphQlResponse<
      {
        content: ResponsiveImage<{ width: number; height: number }>;
        __typename: string;
        id: string;
      },
      {
        title: string;
        slug: string;
        __typename: string;
        id: string;
      }
    >;
    footerContent: ModulerContent[];
    image: ResponsiveImage | null;
  };
}

const AboutUsQuery = `
query AboutUsQuery {
    aboutUsModel {
      seo: _seoMetaTags {
        attributes
        content
        tag
      }
      imageTitle
      title
      content {
        links {
          slug
          title
          dateFrom
          dateTo
        }
        value
        blocks {
          id
          __typename
          content ${ImageHelper("aboutus")}
        }
      }
      image ${ImageHelper("aboutus")}
      footerContent {
        ...ECTAFragment
        ...CHSFragment
      }
    }
  }
  ${EmailCallToActionFragment}
  ${CustomHtmlSectionFragment}
`;
export default AboutUsQuery;
