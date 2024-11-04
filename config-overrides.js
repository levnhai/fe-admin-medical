const { override, useBabelRc } = require('customize-cra');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = override((config, env) => {
  // Kiểm tra nếu là môi trường production
  if (env === 'production') {
    config.plugins.push(new BundleAnalyzerPlugin());
  }

  // Sử dụng .babelrc
  useBabelRc()(config);

  return config;
});
