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
        KAFKA_PORT: joi.number().required(),
        KAFKA_HOST: joi.number().required(),
        PROJECTION_CLIENT_ID: joi.number().required(),
        PROJECTION_CONSUMER_ID: joi.number().required(),
      }),
    }),
  ],
  providers: [AppConfigService],
})
export class AppConfigModule {}
