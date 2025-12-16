import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { VideoTranscodedEventDto } from '@app/contracts/video-transcoder';
import { MESSAGE_BROKER, MessageBrokerPort } from '@app/ports/message-broker';

import {
  TranscoderStoragePort,
  TRANSCODER_PORT,
  TranscoderPort,
  TRANSCODER_STORAGE_PORT,
} from '@transcoder/application/ports';

import { TranscodeVideoCommand } from './transcode-video.command';

@CommandHandler(TranscodeVideoCommand)
export class TranscodeVideoHandler implements ICommandHandler<TranscodeVideoCommand, void> {
  public constructor(
    @Inject(TRANSCODER_PORT) private readonly transcoderAdapter: TranscoderPort,
    @Inject(MESSAGE_BROKER)
    private readonly messageBrokerAdapter: MessageBrokerPort,
    @Inject(TRANSCODER_STORAGE_PORT)
    private readonly storagePortAdapter: TranscoderStoragePort,
  ) {}

  public async execute({ transcodeVideoDto }: TranscodeVideoCommand): Promise<void> {
    const { fileIdentifier, videoId } = transcodeVideoDto;

    await this.transcoderAdapter.transcodeVideo({
      fileIdentifier,
      videoId,
    });

    const newFileIdentifier = this.storagePortAdapter.getTranscodedFileIdentifier(videoId);

    const messagePayload: VideoTranscodedEventDto = {
      videoId,
      newIdentifier: newFileIdentifier,
    };

    await this.messageBrokerAdapter.publishMessage(
      'video-service.transcoded',
      JSON.stringify(messagePayload),
    );
  }
}
