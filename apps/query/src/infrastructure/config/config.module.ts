import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '../../.env',
      isGlobal: true,
      validationSchema: joi.object({
        HTTP_PORT: joi.string().required(),
        GRPC_PORT: joi.string().required(),
      }),
    }),
  ],
})
export class AppConfigModule {}
