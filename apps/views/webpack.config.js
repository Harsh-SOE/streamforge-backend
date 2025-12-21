const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = (options, webpack) => {
  return {
    ...options,
    plugins: [
      ...options.plugins,
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.join(__dirname, 'secrets/access.cert'),
            to: path.join(__dirname, '../../dist/apps/views/secrets'),
          },
          {
            from: path.join(__dirname, 'secrets/access.key'),
            to: path.join(__dirname, '../../dist/apps/views/secrets'),
          },
          {
            from: path.join(__dirname, 'secrets/ca.pem'),
            to: path.join(__dirname, '../../dist/apps/views/secrets'),
          },
          {
            from: path.join('libs/proto/views.proto'),
            to: path.join(__dirname, '../../dist/apps/views/proto'),
          },
          {
            from: path.join(__dirname, 'scripts/entrypoint.dev.bash'),
            to: path.join(__dirname, '../../dist/apps/views/scripts'),
          },
          {
            from: path.join(__dirname, 'scripts/entrypoint.prod.bash'),
            to: path.join(__dirname, '../../dist/apps/views/scripts'),
          },
          {
            from: path.join(__dirname, 'scripts/watch.lua'),
            to: path.join(__dirname, '../../dist/apps/views/scripts'),
          },
        ],
      }),
    ],
  };
};
