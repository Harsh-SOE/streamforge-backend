import * as joi from 'joi';
import { ConfigModule } from '@nestjs/config';
import { Global, Module } from '@nestjs/common';

import { ENVIRONMENT } from '@app/utils/enums';

import { ViewsConfigService } from './config.service';

@Global()
@Module({
  providers: [ViewsConfigService],
  imports: [
    ConfigModule.forRoot({
      envFilePath: 'apps/views/.env',
      isGlobal: true,
      validationSchema: joi.object({
        NODE_ENVIRONMENT: joi
          .string()
          .valid(...Object.values(ENVIRONMENT))
          .required()
          .default(ENVIRONMENT.DEVELOPMENT),

        HTTP_PORT: joi.number().required(),
        GRPC_PORT: joi.number().required(),

        DATABASE_URL: joi.string().required(),

        GRAFANA_LOKI_URL: joi.string().required(),

        KAFKA_HOST: joi.string().required(),
        KAFKA_PORT: joi.number().required(),
        KAFKA_CA_CERT: joi.string().required(),
        ACCESS_KEY: joi.string().required(),
        ACCESS_CERT: joi.string().required(),
        KAFKA_CLIENT_ID: joi.string().required(),
        KAFKA_CONSUMER_ID: joi.string().required(),
        KAFKA_FLUSH_MAX_WAIT_TIME_MS: joi.string().required(),

        REDIS_HOST: joi.string().required(),
        REDIS_PORT: joi.number().required(),
        REDIS_STREAM_KEY: joi.string().required(),
        REDIS_STREAM_GROUPNAME: joi.string().required(),
      }),
    }),
  ],
  exports: [ViewsConfigService],
})
export class ViewsConfigModule {}
