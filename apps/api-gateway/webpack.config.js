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
            from: path.join('libs/proto/health.proto'),
            to: path.join(__dirname, '../../dist/apps/api-gateway/proto'),
          },
          {
            from: path.join('libs/proto/authz.proto'),
            to: path.join(__dirname, '../../dist/apps/api-gateway/proto'),
          },
          {
            from: path.join('libs/proto/channel.proto'),
            to: path.join(__dirname, '../../dist/apps/api-gateway/proto'),
          },
          {
            from: path.join('libs/proto/comments.proto'),
            to: path.join(__dirname, '../../dist/apps/api-gateway/proto'),
          },
          {
            from: path.join('libs/proto/reaction.proto'),
            to: path.join(__dirname, '../../dist/apps/api-gateway/proto'),
          },
          {
            from: path.join('libs/proto/users.proto'),
            to: path.join(__dirname, '../../dist/apps/api-gateway/proto'),
          },
          {
            from: path.join('libs/proto/videos.proto'),
            to: path.join(__dirname, '../../dist/apps/api-gateway/proto'),
          },
          {
            from: path.join('libs/proto/views.proto'),
            to: path.join(__dirname, '../../dist/apps/api-gateway/proto'),
          },
          {
            from: path.join('libs/proto/query.proto'),
            to: path.join(__dirname, '../../dist/apps/api-gateway/proto'),
          },
          {
            from: path.join(__dirname, 'scripts/entrypoint.dev.bash'),
            to: path.join(__dirname, '../../dist/apps/api-gateway/scripts'),
          },
          {
            from: path.join(__dirname, 'scripts/entrypoint.prod.bash'),
            to: path.join(__dirname, '../../dist/apps/api-gateway/scripts'),
          },
        ],
      }),
    ],
  };
};
