/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    deviceSizes: [150,300,600,900,1200,1500,1800,2100],
    domains: [
      "www.datocms-assets.com",
      "cdn.shopify.com"
    ]
  },
  async redirects () {
    return [{
        source: "/admin",
        destination: "https://admin.midwestraptorjunkies.com/editor",
        permanent: true
    }]
  }
}

module.exports = nextConfig;
