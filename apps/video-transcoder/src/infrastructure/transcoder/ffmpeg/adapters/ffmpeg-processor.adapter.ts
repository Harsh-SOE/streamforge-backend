import path from 'path';
import * as fs from 'fs/promises';
import Ffmpeg from 'fluent-ffmpeg';
import { Inject, Injectable } from '@nestjs/common';
import { createReadStream, createWriteStream } from 'fs';

import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';

import {
  VideosProcessorPort,
  TRANSCODER_STORAGE_PORT,
  TranscoderStoragePort,
  CACHE_PORT,
  CachePort,
} from '@transcoder/application/ports';
import { pipeline } from 'stream/promises';

@Injectable()
export class FFmpegVideoProcessorAdapter implements VideosProcessorPort {
  private readonly ROOT_VIDEOS_FILE_DIR = '/@streamforge/videos';
  private readonly RAW_VIDEOS_FILE_DIR = 'raw';
  private readonly TRANSCODED_VIDEOS_FILE_DIR = 'transcoded';

  public constructor(
    @Inject(TRANSCODER_STORAGE_PORT)
    private readonly storageAdapter: TranscoderStoragePort,
    @Inject(LOGGER_PORT)
    private readonly logger: LoggerPort,
    @Inject(CACHE_PORT) private readonly cacheAdapter: CachePort,
  ) {}

  public async downloadRawFileFromS3(videoId: string): Promise<string> {
    const fileIdentifier = `videos/raw/${videoId}`;
    const rawFileStream = await this.storageAdapter.getRawVideoFileAsReadableStream(fileIdentifier);

    const filePath = `${this.ROOT_VIDEOS_FILE_DIR}/${this.RAW_VIDEOS_FILE_DIR}/${videoId}`;

    await pipeline(rawFileStream, createWriteStream(filePath));

    return filePath;
  }

  public async extractMetadata(filePath: string): Promise<{
    durationSeconds: number;
    sizeBytes: bigint;
    mimeType: string;
    height: number;
    width: number;
  }> {
    const sizeBytes = await fs.stat(filePath);
    return new Promise((resolve, reject) => {
      Ffmpeg.ffprobe(filePath, (error, metadata) => {
        if (error) {
          reject(error as Error);
          return;
        }

        const videoStream = metadata.streams.find((stream) => stream.codec_type === 'video');

        if (!videoStream) {
          reject(new Error('No video stream found'));
          return;
        }

        const durationSeconds = Math.round(Number(metadata.format.duration));

        resolve({
          durationSeconds,
          width: Number(videoStream.width),
          height: Number(videoStream.height),
          sizeBytes: BigInt(sizeBytes.size),
          mimeType: metadata.format.format_name ?? 'video',
        });
      });
    });
  }

  public async transcodeVideo(videoId: string, totalDuration: number): Promise<string> {
    this.logger.alert(`Transcoding video now: ${videoId}`);

    const filePath = `${this.ROOT_VIDEOS_FILE_DIR}/${this.RAW_VIDEOS_FILE_DIR}/${videoId}`;
    const videoFileToTranscode = createReadStream(filePath);

    const outputDir = path.join(this.RAW_VIDEOS_FILE_DIR, this.TRANSCODED_VIDEOS_FILE_DIR, videoId);
    const manifestPath = path.join(outputDir, `${videoId}.m3u8`);
    const segmentPattern = path.join(outputDir, 'segment%03d.ts');

    await fs.mkdir(outputDir, { recursive: true });

    await new Promise<void>((resolve, reject) => {
      Ffmpeg(videoFileToTranscode)
        .videoCodec('libx264')
        .outputOptions(['-preset ultrafast', '-b:v 4M', '-threads 0'])
        .audioCodec('aac')
        .outputOption('-f', 'hls')
        .outputOption('-hls_time', '6')
        .outputOption('-hls_playlist_type', 'vod')
        .outputOption('-hls_segment_filename', segmentPattern)
        .on('error', (err, _, stderr) => {
          this.logger.error(`FFmpeg error for video:${videoId}`, err);
          this.logger.error(`ffmpeg stderr: ${stderr}`);
          reject(err);
        })
        .on('end', () => {
          this.logger.info(`HLS transcoding for ${videoId} finished successfully.`);
          resolve();
        })
        .on('progress', (progress) => {
          const timemark = progress.timemark;
          const currentDuration = timemark
            .split(':')
            .map(Number)
            .reduce((previousValue, currentValue) => previousValue * 60 + currentValue, 0);
          this.logger.info(`Transcoding video: ${progress.percent ?? 0}`);

          const percent = Math.min(99, Math.max(0, (currentDuration / totalDuration) * 100));

          if (Number.isInteger(percent) && percent % 5 === 0) {
            void this.cacheAdapter.setInCache(
              `transcode:progress:${videoId}`,
              String(percent.toFixed(2)),
              10_000,
            );
          }
        })
        .save(manifestPath);
    });

    const { hlsManifestKey } = await this.storageAdapter.uploadTranscodedVideoDirectory({
      videoId,
      directoryPath: outputDir,
    });

    console.log(hlsManifestKey);

    // verify if files were uploaded successfully
    // await this.storageAdapter.verifyFileExists(hlsManifestKey);

    // delete local files...
    await fs.rm(outputDir, {
      recursive: true,
      force: true,
    });
    await fs.rm(filePath, { force: true });

    return hlsManifestKey;
  }

  async processVideo(videoId: string): Promise<{
    videoId: string;
    durationSeconds: number;
    sizeBytes: bigint;
    mimeType: string;
    height: number;
    width: number;
    hlsManifestKey: string;
  }> {
    const filePath = await this.downloadRawFileFromS3(videoId);
    const metadata = await this.extractMetadata(filePath);
    const hlsManifestKey = await this.transcodeVideo(videoId, metadata.durationSeconds);
    return {
      videoId,
      ...metadata,
      hlsManifestKey,
    };
  }
}
