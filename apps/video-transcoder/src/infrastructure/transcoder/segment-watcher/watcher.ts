import path from 'path';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import chokidar, { FSWatcher } from 'chokidar';
import { Injectable, OnModuleInit, OnModuleDestroy, Inject } from '@nestjs/common';

import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';

import { SEGMENT_UPLOADER, SEGMENT_UPLOADER_QUEUE } from '@transcoder/utils/constants';

@Injectable()
export class SegmentWatcher implements OnModuleInit, OnModuleDestroy {
  private watcher: FSWatcher;

  constructor(
    @InjectQueue(SEGMENT_UPLOADER_QUEUE)
    private readonly uploaderQueue: Queue,
    @Inject(LOGGER_PORT)
    private readonly logger: LoggerPort,
  ) {}

  onModuleInit() {
    const segmentDir = path.join(process.cwd(), 'transcoded-videos');
    const indexDir = './transcoded-videos';

    this.logger.info(`Chokidar is watching '${segmentDir}' for segment files`);
    this.logger.info(`Chokidar is watching '${indexDir}' for segment files`);

    this.watcher = chokidar.watch(segmentDir, {
      ignoreInitial: true,
      persistent: true,
      usePolling: true,
      interval: 200,
      awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100,
      },
    });

    this.watcher.on('ready', () => {
      this.logger.info('✅ Chokidar is Ready and Scanning');
    });

    this.watcher.on('addDir', (path) => {
      this.logger.info(`Dir ${path} was created in the directory that was being watched`);
    });

    this.watcher.on('add', (filePath) => {
      this.logger.info(`file ${filePath} was created in the directory that was being watched`);

      this.uploaderQueue
        .add(SEGMENT_UPLOADER, { filePath })
        .catch((err) => this.logger.error(`Error occured in chokidar`, err as Error));

      this.logger.info(`Job added to upload queue...`);
    });
  }

  async onModuleDestroy() {
    if (this.watcher) {
      await this.watcher.close();
    }
  }
}
