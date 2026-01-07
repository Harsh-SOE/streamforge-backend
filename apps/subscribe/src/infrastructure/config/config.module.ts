import * as joi from 'joi';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { SubscribeConfigService } from './config.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/subscribe/.env',
      validationSchema: joi.object({
        HTTP_PORT: joi.string().required(),
        GRPC_PORT: joi.string().required(),
      }),
    }),
  ],
  providers: [SubscribeConfigService],
})
export class SubscribeConfigModule {}
