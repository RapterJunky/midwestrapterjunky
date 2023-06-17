import {
  type SeoOrFaviconTag,
  type FaviconAttributes,
  type TitleMetaLinkTag,
} from "react-datocms";
import type { Metadata } from "next";

type Opt = {
  icons?: SeoOrFaviconTag[];
  title: string;
  robots?: boolean;
  description?: string;
  url?: string;
  category?: string;
  datocms?: SeoOrFaviconTag[] | TitleMetaLinkTag[];
};

const getGenericSeoTags = ({
  category,
  icons,
  description,
  robots = true,
  title,
  url = "https://midwestraptorjunkies.com",
}: Opt): Metadata => {
  return {
    category,
    title: `${title} - Midwest Raptor Junkies`,
    description,
    icons: icons
      ? icons.map((icon) => ({
          url: (icon.attributes as FaviconAttributes).href,
          rel: (icon.attributes as FaviconAttributes).rel,
          type: (icon.attributes as FaviconAttributes).type,
          sizes: (icon.attributes as FaviconAttributes).sizes,
        }))
      : undefined,
    openGraph: {
      locale: "en-US",
      url,
      title: `${title} - Midwest Raptor Junkies`,
      siteName: "Midwest Raptor Junkies",
      type: "website",
      description,
    },
    robots: {
      index: robots,
      follow: robots,
      nocache: !robots,
      googleBot: {
        index: robots,
        follow: robots,
      },
    },
  };
};

export default getGenericSeoTags;
