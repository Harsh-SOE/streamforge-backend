import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { LOGGER_PORT, LoggerPort } from '@app/ports/logger';

import { UsersStoragePort } from '@users/application/ports';
import { UserConfigService } from '@users/infrastructure/config';

@Injectable()
export class AwsS3StorageAdapter implements OnModuleInit, UsersStoragePort {
  private readonly AWS_S3_RAW_AVATAR_PATH = 'raw-avatar';
  private s3Client: S3Client;

  public constructor(
    private readonly configService: UserConfigService,
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

  public async getPresignedUrlForUserAvatar(
    userAvatarFileName: string,
    expiresIn?: number,
  ): Promise<string> {
    const key = `${this.AWS_S3_RAW_AVATAR_PATH.toString()}/${userAvatarFileName}`;

    const putObjectCommand = new PutObjectCommand({
      Key: key,
      Bucket: this.configService.AWS_BUCKET,
    });

    return await getSignedUrl(this.s3Client, putObjectCommand, { expiresIn });
  }
}
