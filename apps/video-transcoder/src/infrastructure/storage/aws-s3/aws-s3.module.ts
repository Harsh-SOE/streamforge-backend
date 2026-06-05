import { Module } from '@nestjs/common';

import { TRANSCODER_STORAGE_PORT } from '@transcoder/application/ports';

import { AwsS3StorageAdapter } from './adapters';

@Module({
  imports: [],
  providers: [{ provide: TRANSCODER_STORAGE_PORT, useClass: AwsS3StorageAdapter }],
  exports: [TRANSCODER_STORAGE_PORT],
})
export class AwsS3Module {}
