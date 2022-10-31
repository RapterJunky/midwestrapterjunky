/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["www.datocms-assets.com"]
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
