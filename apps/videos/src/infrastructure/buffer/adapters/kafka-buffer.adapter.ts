import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Consumer, EachBatchPayload, KafkaMessage, Producer } from 'kafkajs';

import { Entity } from '@app/common';
import { KafkaClient } from '@app/clients/kafka';
import { BufferMessage } from '@app/common/buffer';
import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';

import {
  VideosBufferPort,
  VIDEOS_RESPOSITORY_PORT,
  VideoRepositoryPort,
} from '@videos/application/ports';
import { VideoAggregate } from '@videos/domain/aggregates';

import { isVideoBufferMessage } from '../guards';
import { VideoBufferMessage, VideoBufferMessagePayload } from '../types';

@Injectable()
export class KafkaBufferAdapter implements OnModuleInit, OnModuleDestroy, VideosBufferPort {
  private readonly consumer: Consumer;
  private readonly producer: Producer;

  public constructor(
    @Inject(VIDEOS_RESPOSITORY_PORT)
    private readonly videosRepository: VideoRepositoryPort,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
    private readonly kafka: KafkaClient,
  ) {
    this.consumer = kafka.getConsumer({ groupId: 'videos', allowAutoTopicCreation: true });
    this.producer = kafka.getProducer({ allowAutoTopicCreation: true });
  }

  public async onModuleInit() {
    await this.connect();

    await this.consumer.subscribe({
      topic: 'buffer',
      fromBeginning: true,
    });

    await this.consumer.run({
      eachBatch: async (payload: EachBatchPayload) => {
        const { batch } = payload;

        if (batch.topic !== 'buffer') {
          return;
        }

        await this.processVideosMessages(this.getVideoMessages(batch.messages));
      },
    });
  }

  public async onModuleDestroy() {
    await this.disconnect();
  }

  public async connect(): Promise<void> {
    await this.consumer.connect();
    await this.producer.connect();
  }

  public async disconnect(): Promise<void> {
    await this.consumer.disconnect();
    await this.consumer.disconnect();
  }

  public async bufferVideo(video: VideoAggregate): Promise<void> {
    const {
      id,
      channelId,
      ownerId,
      categories,
      state,
      title,
      videoFileIdentifier,
      videoThumbnailIdentifier,
      visibilityState,
      hlsManifestIdentifier,
      failureReason,
      description,
    } = video.getSnapshot();

    const videoBufferMessage = new VideoBufferMessage({
      id,
      channelId,
      description,
      ownerId,
      state,
      title,
      videoCategories: categories,
      videoFileIdentifier,
      videoThumbnailIdentifier: videoThumbnailIdentifier,
      visibilityState,
      hlsManifestKey: hlsManifestIdentifier,
      failureReason,
    });

    await this.producer.send({
      topic: 'buffer',
      messages: [{ value: JSON.stringify(videoBufferMessage) }],
    });
  }

  private getVideoMessages(messages: KafkaMessage[]): VideoBufferMessage[] {
    return messages
      .map(
        (message) =>
          JSON.parse(message.value!.toString()) as BufferMessage<Entity, VideoBufferMessagePayload>,
      )
      .filter(isVideoBufferMessage);
  }

  private async processVideosMessages(messages: VideoBufferMessage[]) {
    const videoPayload = messages.map((message) => message.payload);

    const models = videoPayload.map((message) => {
      return VideoAggregate.create({
        id: message.id,
        userId: message.ownerId,
        channelId: message.channelId,
        title: message.title,
        videoThumbnailIdentifier: message.videoThumbnailIdentifier,
        videoFileIdentifier: message.videoFileIdentifier,
        categories: message.videoCategories,
        state: message.state,
        visibilityState: message.visibilityState,
        description: message.description,
        hlsManifestIdentifier: message.hlsManifestKey,
      });
    });

    this.logger.info(`Saving ${models.length} likes in database`);

    await this.videosRepository.saveManyVideos(models);

    this.logger.info(`${models.length} likes saved in database`);
  }
}
