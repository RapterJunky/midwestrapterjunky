const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = withBundleAnalyzer({
  productionBrowserSourceMaps: process.env.VERCEL_ENV !== "production",
  reactStrictMode: true,
  /*experimental: {
    swcPlugins: [["next-superjson-plugin", {}]],
  },*/
  images: {
    deviceSizes: [150, 300, 600, 900, 1200, 1500, 1800, 2100],
    domains: [
      "www.datocms-assets.com",
      "cdn.shopify.com",
      "api.lorem.space",
      "images.unsplash.com",
      "api.dicebear.com",
      "img.youtube.com",
      "lh3.googleusercontent.com",
      "square-catalog-sandbox.s3.amazonaws.com",
      "square-catalog.s3.amazonaws.com",
    ],
  },
  async redirects() {
    return [
      {
        source: "/admin",
        destination: "https://admin.midwestraptorjunkies.com/editor",
        permanent: true,
      },
    ];
  },
});

module.exports = nextConfig;
