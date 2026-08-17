/** @type {import('next').NextConfig} */
const { createProxyMiddleware } = require('http-proxy-middleware');
module.exports = {
 
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
