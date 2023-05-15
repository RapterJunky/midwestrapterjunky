import withBundleAnalyzer from "@next/bundle-analyzer";

/**
 * T3
 *
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
!process.env.SKIP_ENV_VALIDATION && (await import("./src/env.mjs"));

const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = withAnalyzer({
  productionBrowserSourceMaps: true, //process.env.VERCEL_ENV !== "production",
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
      "drive.google.com",
      "platform-lookaside.fbsbx.com",
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

export default nextConfig;
