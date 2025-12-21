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
            to: path.join(__dirname, '../../dist/apps/users/secrets'),
          },
          {
            from: path.join(__dirname, 'secrets/access.key'),
            to: path.join(__dirname, '../../dist/apps/users/secrets'),
          },
          {
            from: path.join(__dirname, 'secrets/ca.pem'),
            to: path.join(__dirname, '../../dist/apps/users/secrets'),
          },
          {
            from: path.join('libs/proto/users.proto'),
            to: path.join(__dirname, '../../dist/apps/users/proto'),
          },
          {
            from: path.join(__dirname, 'scripts/entrypoint.dev.bash'),
            to: path.join(__dirname, '../../dist/apps/users/scripts'),
          },
          {
            from: path.join(__dirname, 'scripts/entrypoint.prod.bash'),
            to: path.join(__dirname, '../../dist/apps/users/scripts'),
          },
        ],
      }),
    ],
  };
};
