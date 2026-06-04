import path from 'path';
import * as fsStream from 'fs';
import * as fs from 'fs/promises';
import chokidar, { FSWatcher } from 'chokidar';
import { Injectable, OnModuleInit, OnModuleDestroy, Inject } from '@nestjs/common';

import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';

import { TRANSCODER_STORAGE_PORT, TranscoderStoragePort } from '@transcoder/application/ports';

@Injectable()
export class SegmentWatcher implements OnModuleInit, OnModuleDestroy {
  private watcher: FSWatcher;

  constructor(
    @Inject(LOGGER_PORT)
    private readonly logger: LoggerPort,
    @Inject(TRANSCODER_STORAGE_PORT)
    private readonly transcoderStoragePort: TranscoderStoragePort,
  ) {}

  public onModuleInit() {
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

      this.uploadFileToS3(filePath).catch((error: Error) => {
        this.logger.error(`Failed to process uploaded segment: ${filePath}`, { error: error });
      });

      this.logger.info(`Job added to upload queue...`);
    });
  }

  public async onModuleDestroy() {
    if (this.watcher) {
      await this.watcher.close();
    }
  }

  private async uploadFileToS3(filePath: string) {
    const fileStream = fsStream.createReadStream(filePath);
    const fileName = path.basename(filePath);
    const videoId = path.basename(path.dirname(filePath));

    this.logger.info(`Saving file: ${fileName} with id: ${videoId} to Storage`);

    await this.transcoderStoragePort.uploadTranscodedVideoFileAsStream(
      fileStream,
      videoId,
      fileName,
    );

    if (path.extname(fileName) === '.m3u8') {
      this.logger.alert(`Index file uploaded successfully...`);
      await fs.rm(`/@streamforge/transcoded-videos/${videoId}`, {
        recursive: true,
        force: true,
      });
    }
  }
}
