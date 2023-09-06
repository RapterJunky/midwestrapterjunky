import {
  type SeoOrFaviconTag,
  type FaviconAttributes,
  type TitleMetaLinkTag,
} from "react-datocms";
import type { Metadata } from "next";
import type { ResolvedIcons } from "next/dist/lib/metadata/types/metadata-types";

type Opt = {
  icons?: SeoOrFaviconTag[] | ResolvedIcons | null;
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
    twitter: {
      title: `${title} - Midwest Raptor Junkies`,
      description,
      images: [
        `${process.env.VERCEL_ENV === "development" ? "http" : "https"}://${process.env.VERCEL_URL
        }/twitter-image`,
      ],
    },
    category,
    title: `${title} - Midwest Raptor Junkies`,
    description,
    icons: Array.isArray(icons)
      ? icons.map((icon) => ({
        url: (icon.attributes as FaviconAttributes).href,
        rel: (icon.attributes as FaviconAttributes).rel,
        type: (icon.attributes as FaviconAttributes).type,
        sizes: (icon.attributes as FaviconAttributes).sizes,
      }))
      : icons,
    openGraph: {
      images: [
        `${process.env.VERCEL_ENV === "development" ? "http" : "https"}://${process.env.VERCEL_URL
        }/opengraph-image`,
      ],
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
