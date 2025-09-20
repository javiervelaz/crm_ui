/** @type {import('next').NextConfig} */
const { createProxyMiddleware } = require('http-proxy-middleware');
module.exports = {
 
    // Deshabilita ESLint durante desarrollo y builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Deshabilita los warnings de ESLint en la terminal
  typescript: {
    ignoreBuildErrors: true,
  },
    webpack: (config, { isServer }) => {
      if (!isServer) {
        config.resolve.fallback = {
          fs: false,
          module: false,
          path: false,
        };
      }
  
      return config;
    }
  };
