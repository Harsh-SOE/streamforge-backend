import path from 'path';
import * as joi from 'joi';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PlaylistConfigService } from './config.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.join(__dirname, '../../.env'),
      validationSchema: joi.object({
        HTTP_PORT: joi.string().required(),
        GRPC_PORT: joi.string().required(),
      }),
    }),
  ],
  providers: [PlaylistConfigService],
})
export class PlaylistConfigModule {}
