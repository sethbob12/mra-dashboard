// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://mra-dashboard.vercel.app', // your deployed Vercel URL
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/api' // keep the same path
      },
    })
  );
};
