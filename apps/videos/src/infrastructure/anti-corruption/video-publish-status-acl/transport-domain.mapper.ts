import { VideoTransportPublishStatus } from '@app/contracts/videos';

import { VideoDomainPublishStatus } from '@videos/domain/enums';

const TransportToDomainPublishEnumMapper: Record<
  VideoTransportPublishStatus,
  VideoDomainPublishStatus
> = {
  [VideoTransportPublishStatus.TRANSPORT_PENDING]: VideoDomainPublishStatus.PENDING,
  [VideoTransportPublishStatus.TRANSPORT_PROCESSING]: VideoDomainPublishStatus.PROCESSING,
  [VideoTransportPublishStatus.TRANSPORT_PROCESSED]: VideoDomainPublishStatus.PROCESSED,
  [VideoTransportPublishStatus.TRANSPORT_PUBLISHED]: VideoDomainPublishStatus.PUBLISHED,
  [VideoTransportPublishStatus.TRANSPORT_FAILED]: VideoDomainPublishStatus.FAILED,
  [VideoTransportPublishStatus.UNRECOGNIZED]: VideoDomainPublishStatus.FAILED,
};
export { TransportToDomainPublishEnumMapper };
