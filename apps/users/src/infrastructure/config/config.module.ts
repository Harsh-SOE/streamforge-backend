import * as joi from 'joi';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';
import { Global, Module } from '@nestjs/common';

import { UserConfigService } from './config.service';

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
        MAX_DB_CONNECTIONS: joi.number().required(),
        MIN_DB_CONNECTIONS: joi.number().required(),
        DB_IDLE_CONNECTION_TIMEOUT: joi.number().required(),
        DB_QUERY_CONNECTION_TIMEOUT: joi.number().required(),

        AWS_REGION: joi.string().required(),
        AWS_BUCKET: joi.string().required(),
        AWS_ACCESS_KEY: joi.string().required(),
        AWS_ACCESS_SECRET: joi.string().required(),

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
  providers: [UserConfigService],
  exports: [UserConfigService],
})
export class UserConfigModule {}
