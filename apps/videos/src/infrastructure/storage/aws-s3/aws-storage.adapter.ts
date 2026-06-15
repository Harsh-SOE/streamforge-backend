import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';

import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';

import { VideosStoragePort } from '@videos/application/ports';
import { VideosConfigService } from '@videos/infrastructure/config';

@Injectable()
export class VideosAwsS3StorageAdapter implements OnModuleInit, VideosStoragePort {
  private readonly VIDEOS_ROOT_DIR = 'videos';
  private readonly THUMBNAIL_ROOT_DIR = 'thumbails';

  private readonly RAW_DIR = 'raw';

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
    videoId: string,
    expiresIn?: number,
  ): Promise<{ presignedUrl: string; fileIdentifier: string }> {
    const key = `${this.VIDEOS_ROOT_DIR.toString()}/${this.RAW_DIR}/${videoId}`;

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
    videoId: string,
    expiresIn?: number,
  ): Promise<{ presignedUrl: string; fileIdentifier: string }> {
    const key = `${this.THUMBNAIL_ROOT_DIR.toString()}/${this.RAW_DIR}/${videoId}`;

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

  async verifyRawMedia(videoId: string): Promise<{ exists: boolean }> {
    const videosKey = `${this.VIDEOS_ROOT_DIR.toString()}/${this.RAW_DIR}/${videoId}`;
    const thumbnailKey = `${this.THUMBNAIL_ROOT_DIR.toString()}/${this.RAW_DIR}/${videoId}`;

    const getVideoMetadataCommand = new HeadObjectCommand({
      Bucket: this.configService.AWS_BUCKET,
      Key: videosKey,
    });

    const getThumbnailMetadataCommand = new HeadObjectCommand({
      Bucket: this.configService.AWS_BUCKET,
      Key: thumbnailKey,
    });

    const videoMetadata = await this.s3Client.send(getVideoMetadataCommand);
    const thumbnailMetadata = await this.s3Client.send(getThumbnailMetadataCommand);

    return {
      exists: videoMetadata && thumbnailMetadata ? true : false,
    };
  }
}
