import type { SeoOrFaviconTag } from "react-datocms/seo";
import type { ResponsiveImage } from "@/types/page";
import ImageHelper from "../fragments/ImageHelper";

export type SponsorsQueryResult = {
  sponsor: {
    seo: SeoOrFaviconTag[];
    sponsors: {
      link: string | null;
      sponsorName: string;
      id: string;
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
        sponsorName
        logo ${ImageHelper("sponsor")}
      }
    }
  }
`;

export default SponsorsQuery;
