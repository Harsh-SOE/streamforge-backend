import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { TRANSCODER_QUEUE_PORT } from '@transcoder/application/ports';
import { TranscoderConfigModule, TranscoderConfigService } from '@transcoder/infrastructure/config';

import { BullMQTranscoderWorker } from './workers';
import { PROCESSOR_JOB_QUEUE } from './constants';
import { BullMQTranscoderQueueAdapter } from './adapters';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [TranscoderConfigModule],
      inject: [TranscoderConfigService],
      useFactory: (configService: TranscoderConfigService) => ({
        connection: {
          url: `${configService.REDIS_HOST}:${configService.REDIS_PORT}`,
        },
      }),
    }),
    BullModule.registerQueue({ name: PROCESSOR_JOB_QUEUE }),
  ],
  providers: [
    {
      provide: TRANSCODER_QUEUE_PORT,
      useClass: BullMQTranscoderQueueAdapter,
    },
    BullMQTranscoderWorker,
  ],
  exports: [TRANSCODER_QUEUE_PORT, BullMQTranscoderWorker],
})
export class BullMQTranscoderModule {}
