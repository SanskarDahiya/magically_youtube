/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      fs: false,
      module: false,
      path: false,
      os: false,
      crypto: false,
      encoding: false,
    }

    return config
  },
}

module.exports = nextConfig
