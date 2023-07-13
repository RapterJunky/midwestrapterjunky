import type { MetadataRoute } from "next";

const root = `http${process.env.VERCEL_ENV === "development" ? "" : "s"}://${
  process.env.VERCEL_URL
}`;

const routes = [
  root,
  `${root}/signin`,
  `${root}/signout`,
  `${root}/calendar`,
  `${root}/sponsors`,
  `${root}/shop`,
  `${root}/community`,
  `${root}/blog`,
  `${root}/blog/list`,
  `${root}/about-us`,
  `${root}/terms-of-service`,
  `${root}/pricacy-policy`,
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({ url: route, lastModified: new Date() }));
}
