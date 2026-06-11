import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';

import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';

import { VideosStoragePort } from '@videos/application/ports';
import { VideosConfigService } from '@videos/infrastructure/config';

@Injectable()
export class AwsS3StorageAdapter implements OnModuleInit, VideosStoragePort {
  private readonly AWS_S3_RAW_VIDEOS_PATH = 'raw-videos';
  private readonly AWS_S3_RAW_THUMBNAIL_PATH = 'raw-thumbnail';
  private s3Client: S3Client;

  public constructor(
    private readonly configService: VideosConfigService,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
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

  public async getPresignedUrlForVideo(
    videoFileName: string,
    expiresIn?: number,
  ): Promise<{ presignedUrl: string; fileIdentifier: string }> {
    const key = `${this.AWS_S3_RAW_VIDEOS_PATH.toString()}/${videoFileName}`;

    this.logger.info(`Generating presigned url for key:${key}`);

    const putObjectCommand = new PutObjectCommand({
      Key: key,
      Bucket: this.configService.AWS_BUCKET,
    });

    const presignedUrl = await getSignedUrl(this.s3Client, putObjectCommand, {
      expiresIn,
    });
    return { presignedUrl, fileIdentifier: key };
  }

  async getPresignedUrlForThumbnail(
    thumbnailFileIdentifier: string,
    expiresIn?: number,
  ): Promise<{ presignedUrl: string; fileIdentifier: string }> {
    const key = `${this.AWS_S3_RAW_THUMBNAIL_PATH.toString()}/${thumbnailFileIdentifier}`;

    this.logger.info(`Generating presigned url for key:${key}`);

    const putObjectCommand = new PutObjectCommand({
      Key: key,
      Bucket: this.configService.AWS_BUCKET,
    });

    const presignedUrl = await getSignedUrl(this.s3Client, putObjectCommand, {
      expiresIn,
    });
    return { presignedUrl, fileIdentifier: key };
  }
}
