import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import * as joi from 'joi';

import { AppConfigService } from './config.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(__dirname, '../../.env'),
      validationSchema: joi.object({
        PORT: joi.number().required(),

        NODE_ENVIRONMENT: joi.string().required(),

        JWT_ACCESS_TOKEN_SECRET: joi.string().required(),
        JWT_ACCESS_TOKEN_EXPIRY: joi.string().required(),

        REDIS_HOST: joi.string().required(),
        REDIS_PORT: joi.number().required(),

        AUTH0_CLIENT_ID: joi.string().required(),
        AUTH0_CLIENT_SECRET: joi.string().required(),
        AUTH0_CLIENT_DOMAIN: joi.string().required(),
        AUTH0_CALLBACK_URL: joi.string().required(),
        EXPRESS_SESSION_SECRET: joi.string().required(),

        USER_SERVICE_HOST: joi.string().required(),
        CHANNEL_SERVICE_HOST: joi.string().required(),
        REACTION_SERVICE_HOST: joi.string().required(),
        VIDEO_SERVICE_HOST: joi.string().required(),
        WATCH_SERVICE_HOST: joi.string().required(),
        COMMENT_SERVICE_HOST: joi.string().required(),
        QUERY_SERVICE_HOST: joi.string().required(),

        CHANNEL_SERVICE_PORT: joi.number().required(),
        USER_SERVICE_PORT: joi.number().required(),
        REACTION_SERVICE_PORT: joi.number().required(),
        VIDEO_SERVICE_PORT: joi.number().required(),
        WATCH_SERVICE_PORT: joi.number().required(),
        COMMENT_SERVICE_PORT: joi.number().required(),
        QUERY_SERVICE_PORT: joi.number().required(),

        GRAFANA_LOKI_URL: joi.string().required(),
        FRONTEND_URL: joi.string().required(),
      }),
    }),
  ],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class AppConfigModule {}
