import {
  type SeoOrFaviconTag,
  type TitleMetaLinkTag,
  toNextMetadata,
} from "react-datocms/seo";
import type { Metadata, ResolvingMetadata } from "next";

type Opts = {
  seo?: {
    title: string;
    description?: string;
    slug?: string;
    category?: string;
    robots?: boolean;
  };
  metadata?: Metadata;
  parent?: ResolvingMetadata;
  datocms?: TitleMetaLinkTag[] | SeoOrFaviconTag[];
};

const host = `${process.env.VERCEL_ENV === "development" ? "http" : "https"
  }://${process.env.NEXT_PUBLIC_SITE_URL ?? process.env.VERCEL_URL}`;

const defaultRobots = (allow: boolean): Metadata["robots"] => ({
  index: allow,
  follow: allow,
  googleBot: {
    index: allow,
    follow: allow,
  },
});

const defaultSeo = ({
  title,
  description,
  slug = "/",
  category,
  robots = true,
}: NonNullable<Opts["seo"]>): Metadata => {
  const pageTitle = `${title} - Midwest Raptor Junkies`;
  const url = `${host}${slug}`;

  return {
    twitter: {
      title: pageTitle,
      description,
      images: ["/twitter-image"],
    },
    openGraph: {
      url,
      description,
      locale: "en-US",
      title: pageTitle,
      siteName: "Midwest Raptor Junkies",
      type: "website",
      images: ["/opengraph-image"],
    },
    robots: defaultRobots(robots),
    description,
    category,
    title: pageTitle,
  };
};

const getSeoTags = async ({
  parent,
  metadata,
  datocms,
  seo,
}: Opts): Promise<Metadata> => {
  const parentSeo = parent ? await parent : {};
  const datocmsSeo = datocms ? toNextMetadata(datocms) : ({} as Metadata);
  const customMetadata = metadata ? metadata : {};
  const genericSeo = seo ? defaultSeo(seo) : {};

  return {
    ...parentSeo,
    ...datocmsSeo,
    ...customMetadata,
    ...genericSeo,
  };
};

export default getSeoTags;
