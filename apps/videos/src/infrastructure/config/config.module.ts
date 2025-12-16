import { ConfigModule } from '@nestjs/config';
import { Global, Module } from '@nestjs/common';
import * as joi from 'joi';
import { join } from 'path';

import { AppConfigService } from './config.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: join(__dirname, '../../.env'),
      isGlobal: true,
      validationSchema: joi.object({
        HTTP_PORT: joi.number().required(),
        GRPC_PORT: joi.number().required(),
        DATABASE_URL: joi.string().required(),
        CACHE_HOST: joi.string().required(),
        CACHE_PORT: joi.number().required(),
        MESSAGE_BROKER_HOST: joi.string().required(),
        MESSAGE_BROKER_PORT: joi.number().required(),
        VIDEO_CLIENT_ID: joi.string().required(),
        VIDEO_CONSUMER_ID: joi.string().required(),
        BUFFER_KEY: joi.string().required(),
        BUFFER_GROUPNAME: joi.string().required(),
        BUFFER_REDIS_CONSUMER_ID: joi.string().required(),
        BUFFER_CLIENT_ID: joi.string().required(),
        BUFFER_KAFKA_CONSUMER_ID: joi.string().required(),
        BUFFER_FLUSH_MAX_WAIT_TIME_MS: joi.string().required(),
        AWS_REGION: joi.string().required(),
        AWS_BUCKET: joi.string().required(),
        AWS_ACCESS_KEY: joi.string().required(),
        AWS_ACCESS_SECRET: joi.string().required(),
        GRAFANA_LOKI_URL: joi.string().required(),
      }),
    }),
  ],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class AppConfigModule {}
