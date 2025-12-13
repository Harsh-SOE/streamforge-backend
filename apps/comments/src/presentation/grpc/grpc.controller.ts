import { Controller, UseFilters } from '@nestjs/common';

import { CommentVideoDto, CommentVideoResponse } from '@app/contracts/comments';

import { GrpcService } from './grpc.service';

import { GrpcFilter } from '../filters';

@Controller('comments')
@UseFilters(GrpcFilter)
export class GrpcController {
  public constructor(private commentsService: GrpcService) {}

  commentVideo(commentVideoDto: CommentVideoDto): Promise<CommentVideoResponse> {
    return this.commentsService.commentOnVideo(commentVideoDto);
  }
}
