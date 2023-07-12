import type { SeoOrFaviconTag } from "react-datocms/seo";

type Opt = {
  title: string;
  robots?: boolean;
  description?: string;
  url?: string;
};

/**
 *
 * @deprecated When using app dir use getGenericSeoTags inplace of this
 */
const genericSeoTags = ({
  title,
  robots = true,
  description = "Midwest Raptor Junkies",
  url = "https://midwestraptorjunkies.com",
}: Opt): SeoOrFaviconTag[] => [
  {
    tag: "meta",
    attributes: {
      name: "twitter:card",
      content: "summary",
    },
  },
  {
    tag: "meta",
    attributes: {
      name: "twitter:title",
      content: `${title} - Midwest Raptor Junkies`,
    },
  },
  {
    tag: "meta",
    attributes: {
      name: "twitter:description",
      content: description,
    },
  },
  {
    tag: "meta",
    attributes: {
      name: "twitter:image",
      content: `${
        process.env.VERCEL_ENV === "development" ? "http" : "https"
      }://${process.env.VERCEL_URL}/twitter-image`,
    },
  },
  {
    tag: "meta",
    attributes: {
      property: "og:locale",
      content: "en-US",
    },
  },
  {
    tag: "meta",
    attributes: {
      property: "og:image",
      content: `${
        process.env.VERCEL_ENV === "development" ? "http" : "https"
      }://${process.env.VERCEL_URL}/opengraph-image`,
    },
  },
  {
    tag: "meta",
    attributes: {
      property: "og:url",
      content: url,
    },
  },
  {
    tag: "title",
    content: `${title} - Midwest Raptor Junkies`,
  },
  {
    tag: "meta",
    attributes: {
      property: "og:title",
      content: `${title} - Midwest Raptor Junkies`,
    },
  },
  {
    tag: "meta",
    attributes: {
      name: "robots",
      content: robots ? "index,follow" : "noindex,nofollow",
    },
  },
  {
    tag: "meta",
    attributes: {
      name: "googlebot",
      content: robots ? "index,follow" : "noindex,nofollow",
    },
  },
  {
    tag: "meta",
    attributes: {
      property: "og:site_name",
      content: "Midwest Raptor Junkies",
    },
  },
  {
    tag: "meta",
    attributes: {
      property: "og:type",
      content: "website",
    },
  },
  {
    tag: "meta",
    attributes: {
      name: "description",
      content: description,
    },
  },
  {
    tag: "meta",
    attributes: {
      property: "og:description",
      content: description,
    },
  },
];
export default genericSeoTags;
