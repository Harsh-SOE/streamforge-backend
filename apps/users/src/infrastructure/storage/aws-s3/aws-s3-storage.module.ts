import { Module } from '@nestjs/common';

import { AwsS3StorageAdapter } from './adapters';

@Module({
  providers: [AwsS3StorageAdapter],
})
export class AwsS3StorageModule {}
