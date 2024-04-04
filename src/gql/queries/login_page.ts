import ImageHelper from "../fragments/ImageHelper";
import type { SeoOrFaviconTag } from "react-datocms/seo";
import type { ResponsiveImage } from "@/types/page";

export type LoginPageQueryResult = {
  login: {
    background: ResponsiveImage;
    welcomeTitle: string;
    welcomeSubheading: string;
    seo: SeoOrFaviconTag[];
  };
};

const LoginPageQuery = `
query LoginPage {
  login {
    background ${ImageHelper("login")}
    welcomeTitle
    welcomeSubheading
    seo: _seoMetaTags {
      attributes
      content
      tag
    }
  }
}
`;

export default LoginPageQuery;
