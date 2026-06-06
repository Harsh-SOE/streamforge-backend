import { Module } from '@nestjs/common';

import { TRANSCODER_STORAGE_PORT } from '@transcoder/application/ports';

import { SegmentWatcher } from './watcher';
import { AwsS3StorageAdapter } from '../storage/aws-s3';

@Module({
  providers: [{ provide: TRANSCODER_STORAGE_PORT, useClass: AwsS3StorageAdapter }, SegmentWatcher],
})
export class SegmentWatcherModule {}
