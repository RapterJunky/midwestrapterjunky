const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = withBundleAnalyzer({
  reactStrictMode: true,
  images: {
    deviceSizes: [150,300,600,900,1200,1500,1800,2100],
    domains: [
      "www.datocms-assets.com",
      "cdn.shopify.com",
      "api.lorem.space"
    ]
  },
  async redirects () {
    return [{
        source: "/admin",
        destination: "https://admin.midwestraptorjunkies.com/editor",
        permanent: true
    }]
  }
});

module.exports = nextConfig;
