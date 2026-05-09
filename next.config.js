/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // Allow base64 data URLs in next/image (for logo uploads stored as data URIs)
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    remotePatterns: [],
  },
  webpack: (config, { dev }) => {
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        minimize: true,
      }
    }
    return config
  },
  productionBrowserSourceMaps: false,
}

module.exports = nextConfig
