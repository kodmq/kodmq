/** @type {import('next').NextConfig} **/
export default {
  // FIXME: Somewhy minimization breaks the build
  webpack: (config, { isServer }) => {
    config.optimization.minimize = false
    return config
  },

  experimental: {
    serverActions: true,
  },
}
