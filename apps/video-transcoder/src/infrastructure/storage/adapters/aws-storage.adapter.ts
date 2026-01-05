import { Readable } from 'stream';
import { Upload } from '@aws-sdk/lib-storage';
import { RpcException } from '@nestjs/microservices';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';

import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';

import { UploadResult, UploadOptions, TranscoderStoragePort } from '@transcoder/application/ports';
import { TranscoderConfigService } from '@transcoder/infrastructure/config';

@Injectable()
export class AwsS3StorageAdapter implements OnModuleInit, TranscoderStoragePort {
  private readonly AWS_RAW_VIDEOS_KEY = `raw-videos`;
  private readonly AWS_TRANSCODED_VIDEOS_KEY = `transcoded-videos`;

  private s3Client: S3Client;

  public constructor(
    @Inject(LOGGER_PORT)
    private readonly logger: LoggerPort,
    private readonly configService: TranscoderConfigService,
  ) {}

  public onModuleInit() {
    this.s3Client = new S3Client({
      region: this.configService.AWS_REGION,
      credentials: {
        accessKeyId: this.configService.AWS_ACCESS_KEY,
        secretAccessKey: this.configService.AWS_ACCESS_SECRET,
      },
    });
  }

  public getTranscodedFileIdentifier(videoId: string) {
    return `${this.AWS_TRANSCODED_VIDEOS_KEY}/videoId/${videoId}.m3u8`;
  }

  public async getRawVideoFileAsReadableStream(fileIdentifier: string): Promise<Readable> {
    this.logger.alert(`Downloading ${fileIdentifier} file as stream...`);

    const getObjectCommand = new GetObjectCommand({
      Bucket: this.configService.AWS_BUCKET,
      Key: fileIdentifier,
    });
    const data = await this.s3Client.send(getObjectCommand);

    if (!data || !data.Body) {
      throw new RpcException('File stream not found or invalid.');
    }

    const stream = data.Body as Readable;
    return stream;
  }

  public async uploadTranscodedVideoFileAsStream(
    fileStream: Readable,
    videoId: string,
    videoFileName: string,
    options?: UploadOptions,
  ): Promise<UploadResult> {
    const key = `${this.AWS_TRANSCODED_VIDEOS_KEY}/${videoId}/${videoFileName}`;

    const uploader = new Upload({
      client: this.s3Client,
      params: {
        Bucket: this.configService.AWS_BUCKET,
        Key: key,
        Body: fileStream,
        ContentType: options?.contentType,
      },
      queueSize: options?.multipart?.concurrency,
      partSize: options?.multipart?.partSizeBytes,
      leavePartsOnError: !!options?.resumable,
    });

    uploader.on('httpUploadProgress', (progress) => {
      this.logger.info(`Uploaded: ${progress.loaded}/${progress.total} bytes`);
    });

    const aborter = options?.abortSignal;
    if (aborter) {
      aborter.addEventListener('abort', () => {
        uploader
          .abort()
          .then(() => this.logger.info('Upload aborted cleanly.'))
          .catch((err) => this.logger.error('Error while aborting', err as Error));
      });
    }
    await uploader.done();

    return { key: videoId };
  }
}
