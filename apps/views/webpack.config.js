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
