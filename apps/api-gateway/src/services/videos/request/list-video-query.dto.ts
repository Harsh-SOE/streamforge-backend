export class ListVideosQueryDto {
  limit?: number;
  cursor?: number;
  categories?: string[];
  channelId?: string;
  userId?: string;
  search?: string;
  sort?: 'newest' | 'oldest' | 'popular';
}
