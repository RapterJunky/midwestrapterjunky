import ImageHelper from "../fragments/ImageHelper";
import type { SeoOrFaviconTag } from "react-datocms/seo";
import type { ResponsiveImage } from "@/types/page";

export type SponsorsQueryResult = {
  sponsor: {
    seo: SeoOrFaviconTag[];
    sponsors: {
      link: string | null;
      sponsorName: string;
      id: string;
      description: string | null;
      logo: ResponsiveImage;
    }[];
  };
};

const SponsorsQuery = `
query SponsorsQuery {
    sponsor {
      seo: _seoMetaTags {
        attributes
        content
        tag
      }
      sponsors {
        link
        id
        description
        sponsorName
        logo ${ImageHelper("sponsor")}
      }
    }
  }
`;

export default SponsorsQuery;
