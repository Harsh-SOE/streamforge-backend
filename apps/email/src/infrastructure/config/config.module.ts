import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import * as joi from 'joi';

import { AppConfigService } from './config.service';

@Module({
  providers: [AppConfigService],
  imports: [
    ConfigModule.forRoot({
      envFilePath: join(__dirname, '../../.env'),
      isGlobal: true,
      validationSchema: joi.object({
        HTTP_PORT: joi.number().required(),
        GRAFANA_LOKI_URL: joi.string().required(),

        KAFKA_HOST: joi.string().required(),
        KAFKA_PORT: joi.number().required(),
        KAFKA_CLIENT_ID: joi.string().required(),
        KAFKA_CONSUMER_ID: joi.string().required(),
        KAFKA_FLUSH_MAX_WAIT_TIME_MS: joi.string().required(),

        EMAIL_API_KEY: joi.string().required(),
        FROM_EMAIL: joi.string().required(),
      }),
    }),
  ],
  exports: [AppConfigService],
})
export class AppConfigModule {}
