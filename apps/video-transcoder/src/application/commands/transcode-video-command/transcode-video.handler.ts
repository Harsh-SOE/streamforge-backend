import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { TRANSCODER_PORT, TranscoderPort } from '@transcoder/application/ports';

import { TranscodeVideoCommand } from './transcode-video.command';

@CommandHandler(TranscodeVideoCommand)
export class TranscodeVideoHandler implements ICommandHandler<TranscodeVideoCommand, void> {
  public constructor(
    @Inject(TRANSCODER_PORT)
    private readonly transcoderAdapter: TranscoderPort,
  ) {}

  public async execute({ transcodeVideoDto }: TranscodeVideoCommand): Promise<void> {
    const { fileIdentifier, videoId } = transcodeVideoDto;

    await this.transcoderAdapter.transcodeVideo({
      fileIdentifier,
      videoId,
    });
  }
}
