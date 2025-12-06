import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import path from 'path';
import * as joi from 'joi';

import { AppConfigService } from './config.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.join(__dirname, '../../.env'),
      validationSchema: joi.object({
        HTTP_PORT: joi.number().required(),
        KAFKA_HOST: joi.string().required(),
        KAFKA_PORT: joi.number().required(),
        PROJECTION_CLIENT_ID: joi.string().required(),
        PROJECTION_CONSUMER_ID: joi.string().required(),
        MESSAGE_BROKER_HOST: joi.string().required(),
        MESSAGE_BROKER_PORT: joi.number().required(),
        BUFFER_KEY: joi.string().required(),
        BUFFER_GROUPNAME: joi.string().required(),
        BUFFER_REDIS_CONSUMER_ID: joi.string().required(),
        BUFFER_CLIENT_ID: joi.string().required(),
        BUFFER_KAFKA_CONSUMER_ID: joi.string().required(),
        BUFFER_FLUSH_MAX_WAIT_TIME_MS: joi.number().required(),
        GRAFANA_LOKI_URL: joi.string().required(),
      }),
    }),
  ],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class AppConfigModule {}
