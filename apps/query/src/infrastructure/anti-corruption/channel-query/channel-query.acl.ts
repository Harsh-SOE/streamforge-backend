import { Injectable } from '@nestjs/common';

import { ChannelQueryModel } from '@query/queries/models';
import { ChannelProjectionModel } from '@query/infrastructure/repository/models';

@Injectable()
export class ChannelQueryACL {
  public channelProjectionSchemaToQueryModel(
    projectionModel: ChannelProjectionModel,
  ): ChannelQueryModel {
    return {
      channelId: projectionModel.channelId,
      userId: projectionModel.userId,
      bio: projectionModel.bio,
      coverImage: projectionModel.coverImage,
      handle: projectionModel.handle,
      subscribers: projectionModel.subscribers,
      videoCount: projectionModel.videoCount,
    };
  }
}
