const { withAxiom } = require('next-axiom')

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
  env: {
    LOCO_TOKEN: process.env.LOCO_TOKEN,
    IVORY_URL: 'https://ivory.getloconow.com/v1',
    CHAT_URL: 'https://chat.getloconow.com/v2',
    MONGODB_URI: process.env.MONGODB_URI,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  },
}

module.exports = withAxiom(nextConfig)
