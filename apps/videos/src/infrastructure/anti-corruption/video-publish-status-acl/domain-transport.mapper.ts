import { VideoTransportPublishStatus } from '@app/contracts/videos';

import { VideoDomainPublishStatus } from '@videos/domain/enums';

const DomainToTransportPublishEnumMapper: Record<
  VideoDomainPublishStatus,
  VideoTransportPublishStatus
> = {
  [VideoDomainPublishStatus.PENDING]: VideoTransportPublishStatus.TRANSPORT_PENDING,
  [VideoDomainPublishStatus.PROCESSING]: VideoTransportPublishStatus.TRANSPORT_PROCESSING,
  [VideoDomainPublishStatus.PROCESSED]: VideoTransportPublishStatus.TRANSPORT_PROCESSED,
  [VideoDomainPublishStatus.PUBLISHED]: VideoTransportPublishStatus.TRANSPORT_PUBLISHED,
  [VideoDomainPublishStatus.FAILED]: VideoTransportPublishStatus.TRANSPORT_FAILED,
};

export { DomainToTransportPublishEnumMapper };
