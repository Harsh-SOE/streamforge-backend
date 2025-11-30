export class ChannelQueryModel {
  public readonly id: string;
  public readonly userId: string;
  public readonly bio: string | null;
  public readonly isChannelMonitized: boolean | null;
  public readonly isChannelVerified: boolean | null;
  public readonly ChannelCoverImage: string | null;
}
