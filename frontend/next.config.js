/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Remove appDir setting as it's deprecated in Next.js 14
    // appDir: false, // We're using pages router
  },
  env: {
    CUSTOM_KEY: 'socratic-wingman',
  },
  images: {
    domains: ['localhost'],
  },
  // Remove source maps in production for security
  productionBrowserSourceMaps: false,
  // Disable x-powered-by header
  poweredByHeader: false,
  // Optimize bundle size
  swcMinify: true,
  // Enable webpack bundle analyzer in development
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle splitting
    if (!isServer) {
      config.optimization.splitChunks.chunks = 'all';
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        vendor: {
          name: 'vendor',
          test: /[\\/]node_modules[\\/]/,
          chunks: 'all',
          enforce: true,
        },
        ui: {
          name: 'ui',
          test: /[\\/]src[\\/]components[\\/]ui[\\/]/,
          chunks: 'all',
          enforce: true,
        },
      };
    }
    return config;
  },
  // Enable compression
  compress: true,
  // Optimize loading performance
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
}

module.exports = nextConfig
