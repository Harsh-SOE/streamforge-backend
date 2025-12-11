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
            from: path.join(__dirname, 'proto/health.proto'),
            to: path.join(__dirname, '../../dist/apps/api-gateway/proto'),
          },
          {
            from: path.join(__dirname, 'proto/aggregator.proto'),
            to: path.join(__dirname, '../../dist/apps/api-gateway/proto'),
          },
          {
            from: path.join(__dirname, 'proto/authz.proto'),
            to: path.join(__dirname, '../../dist/apps/api-gateway/proto'),
          },
          {
            from: path.join(__dirname, 'proto/channel.proto'),
            to: path.join(__dirname, '../../dist/apps/api-gateway/proto'),
          },
          {
            from: path.join(__dirname, 'proto/comments.proto'),
            to: path.join(__dirname, '../../dist/apps/api-gateway/proto'),
          },
          {
            from: path.join(__dirname, 'proto/email.proto'),
            to: path.join(__dirname, '../../dist/apps/api-gateway/proto'),
          },
          {
            from: path.join(__dirname, 'proto/reaction.proto'),
            to: path.join(__dirname, '../../dist/apps/api-gateway/proto'),
          },
          {
            from: path.join(__dirname, 'proto/saga.proto'),
            to: path.join(__dirname, '../../dist/apps/api-gateway/proto'),
          },
          {
            from: path.join(__dirname, 'proto/users.proto'),
            to: path.join(__dirname, '../../dist/apps/api-gateway/proto'),
          },
          {
            from: path.join(__dirname, 'proto/videos.proto'),
            to: path.join(__dirname, '../../dist/apps/api-gateway/proto'),
          },
          {
            from: path.join(__dirname, 'proto/views.proto'),
            to: path.join(__dirname, '../../dist/apps/api-gateway/proto'),
          },
          {
            from: path.join(__dirname, 'proto/query.proto'),
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
