import { Controller, UseFilters } from '@nestjs/common';

import { CommentVideoDto, CommentVideoResponse } from '@app/contracts/protocols/comments';

import { RpcService } from './rpc.service';

import { GrpcFilter } from '../filters';

@Controller('comments')
@UseFilters(GrpcFilter)
export class RpcController {
  public constructor(private commentsService: RpcService) {}

  commentVideo(commentVideoDto: CommentVideoDto): Promise<CommentVideoResponse> {
    return this.commentsService.commentOnVideo(commentVideoDto);
  }
}
