import * as joi from 'joi';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ENVIRONMENT } from '@app/utils/enums';

import { EmailConfigService } from './config.service';

@Module({
  providers: [EmailConfigService],
  imports: [
    ConfigModule.forRoot({
      envFilePath: 'apps/email/.env',
      isGlobal: true,
      validationSchema: joi.object({
        NODE_ENVIRONMENT: joi
          .string()
          .valid(...Object.values(ENVIRONMENT))
          .required()
          .default(ENVIRONMENT.DEVELOPMENT),

        HTTP_PORT: joi.number().required(),
        GRAFANA_LOKI_URL: joi.string().required(),

        KAFKA_HOST: joi.string().required(),
        KAFKA_PORT: joi.number().required(),
        KAFKA_CA_CERT: joi.string().required(),
        ACCESS_KEY: joi.string().required(),
        ACCESS_CERT: joi.string().required(),
        KAFKA_CLIENT_ID: joi.string().required(),
        KAFKA_CONSUMER_ID: joi.string().required(),
        KAFKA_FLUSH_MAX_WAIT_TIME_MS: joi.string().required(),

        EMAIL_API_KEY: joi.string().required(),
        FROM_EMAIL: joi.string().required(),
      }),
    }),
  ],
  exports: [EmailConfigService],
})
export class EmailConfigModule {}
