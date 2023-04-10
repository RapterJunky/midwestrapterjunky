import type { SeoOrFaviconTag } from "react-datocms/seo";

type Opt = {
  title: string;
  robots?: boolean;
  description?: string;
  url?: string;
};

const genericSeoTags = ({
  title,
  robots = true,
  description = "Midwest Raptor Junkies",
  url = "https://midwestraptorjunkies.com",
}: Opt): SeoOrFaviconTag[] => [
  {
    tag: "meta",
    attributes: {
      name: "og:url",
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
      name: "og:title",
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
      name: "og:site_name",
      content: "Midwest Raptor Junkies",
    },
  },
  {
    tag: "meta",
    attributes: {
      name: "og:type",
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
      name: "og:description",
      content: description,
    },
  },
];
export default genericSeoTags;
