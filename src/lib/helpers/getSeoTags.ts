import {
  type SeoOrFaviconTag,
  type TitleMetaLinkTag,
  toNextMetadata,
} from "react-datocms/seo";
import type { Metadata, ResolvingMetadata } from "next";
import { host } from "../utils/host";

type Opts = {
  seo?: {
    title: string;
    description?: string;
    slug?: string;
    category?: string;
    robots?: boolean;
  };
  slug?: string;
  metadata?: Metadata;
  parent?: ResolvingMetadata;
  datocms?: TitleMetaLinkTag[] | SeoOrFaviconTag[];
};

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
    alternates: {
      canonical: url,
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
  slug,
}: Opts): Promise<Metadata> => {
  const parentSeo = parent ? await parent : {};
  const datocmsSeo = datocms ? toNextMetadata(datocms) : ({} as Metadata);
  const customMetadata = metadata ? metadata : {};
  const genericSeo = seo ? defaultSeo(seo) : {};

  const canonical = slug
    ? ({
        alternates: {
          canonical: `${host}${slug}`,
        },
      } as Metadata)
    : {};

  const data: Metadata = {
    ...parentSeo,
    ...datocmsSeo,
    ...customMetadata,
    ...genericSeo,
    ...canonical,
  };

  if ("themeColor" in data) {
    delete data.themeColor;
  }
  if ("colorScheme" in data) {
    delete data.colorScheme;
  }
  if ("viewport" in data) {
    delete data.viewport;
  }

  if (data.openGraph && slug && !("url" in data.openGraph)) {
    data.openGraph.url = `${host}${slug}`;
  }

  return data;
};

export default getSeoTags;
