const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (options, webpack) => {
  return {
    ...options,
    plugins: [
      ...options.plugins,
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.join(__dirname, 'secrets/access.cert'),
            to: path.join(__dirname, '../../dist/apps/query/secrets'),
          },
          {
            from: path.join(__dirname, 'secrets/access.key'),
            to: path.join(__dirname, '../../dist/apps/query/secrets'),
          },
          {
            from: path.join(__dirname, 'secrets/ca.pem'),
            to: path.join(__dirname, '../../dist/apps/query/secrets'),
          },
          {
            from: path.join(__dirname, 'scripts/entrypoint.dev.bash'),
            to: path.join(__dirname, '../../dist/apps/query/scripts'),
          },
          {
            from: path.join(__dirname, 'scripts/entrypoint.prod.bash'),
            to: path.join(__dirname, '../../dist/apps/query/scripts'),
          },
          {
            from: path.join('libs/proto/query.proto'),
            to: path.join(__dirname, '../../dist/apps/query/proto'),
          },
        ],
      }),
    ],
  };
};
