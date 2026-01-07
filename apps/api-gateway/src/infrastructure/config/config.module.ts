import * as joi from 'joi';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ENVIRONMENT } from '@app/utils/enums';

import { GatewayConfigService } from './config.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/api-gateway/.env',
      validationSchema: joi.object({
        NODE_ENVIRONMENT: joi
          .string()
          .valid(...Object.values(ENVIRONMENT))
          .required()
          .default(ENVIRONMENT.DEVELOPMENT),

        PORT: joi.number().required(),

        COOKIE_MAX_AGE: joi.number().required(),

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
  providers: [GatewayConfigService],
  exports: [GatewayConfigService],
})
export class GatwayConfigModule {}
