import Navbar from "../fragments/Navbar";
import type { SeoOrFaviconTag } from "react-datocms/seo";
import type { LinkWithIcon, ResponsiveImage } from "@/types/page";

export type GenericPageResult = {
  site: {
    faviconMetaTags: SeoOrFaviconTag[];
  };
  navbar: {
    pageLinks: LinkWithIcon[];
    logo: ResponsiveImage;
  };
};

const GenericPageQuery = `
query GenericPageQuery {
    site: _site {
        faviconMetaTags {
            attributes
            content
            tag
        }
    }
    navbar {
        ...NavbarRecordFragment
    }
}
${Navbar}
`;

export default GenericPageQuery;
