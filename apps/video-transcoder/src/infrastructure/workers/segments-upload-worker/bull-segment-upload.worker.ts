import path from 'path';
import { Job } from 'bullmq';
import * as fsStream from 'fs';
import * as fs from 'fs/promises';
import { Inject, Injectable } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';

import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';

import { SEGMENT_UPLOADER_QUEUE } from '@transcoder/utils/constants';
import { TranscoderStoragePort } from '@transcoder/application/ports';
import { TRANSCODER_STORAGE_PORT } from '@transcoder/application/ports';

@Injectable()
@Processor(SEGMENT_UPLOADER_QUEUE)
export class BullSegmentUploadWorker extends WorkerHost {
  constructor(
    @Inject(TRANSCODER_STORAGE_PORT)
    private readonly transcoderStoragePort: TranscoderStoragePort,
    @Inject(LOGGER_PORT)
    private readonly logger: LoggerPort,
  ) {
    super();
  }

  async process(job: Job<{ filePath: string }>): Promise<any> {
    const { filePath } = job.data;

    this.logger.info(`Uploading '${filePath}' to Storage`);

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
