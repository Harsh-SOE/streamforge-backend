const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (options) => {
  return {
    ...options,
    plugins: [
      ...options.plugins,
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.join('libs/proto/authz.proto'),
            to: path.join(__dirname, '../../dist/apps/authz/proto'),
          },
          {
            from: path.join(__dirname, 'scripts/entrypoint.dev.bash'),
            to: path.join(__dirname, '../../dist/apps/authz/scripts/entrypoint.dev.bash'),
          },
          {
            from: path.join(__dirname, 'scripts/entrypoint.prod.bash'),
            to: path.join(__dirname, '../../dist/apps/authz/scripts/entrypoint.prod.bash'),
          },
          {
            from: path.join(__dirname, 'scripts/openfga.dev.bash'),
            to: path.join(__dirname, '../../dist/apps/authz/scripts/openfga.dev.bash'),
          },
          {
            from: path.join(__dirname, 'scripts/openfga.prod.bash'),
            to: path.join(__dirname, '../../dist/apps/authz/scripts/openfga.prod.bash'),
          },
          {
            from: path.join(__dirname, 'scripts/models/auth.model.json'),
            to: path.join(__dirname, '../../dist/apps/authz/scripts/models'),
          },
        ],
      }),
    ],
  };
};
