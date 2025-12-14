import { VideoTransportPublishStatus } from '@app/contracts/videos';

import { VideoRequestPublishStatus } from '../../enums';

const TransportClientVideoPublishEnumMapper: Record<
  VideoTransportPublishStatus,
  VideoRequestPublishStatus
> = {
  [VideoTransportPublishStatus.TRANSPORT_PENDING]: VideoRequestPublishStatus.PENDING,
  [VideoTransportPublishStatus.TRANSPORT_PROCESSING]: VideoRequestPublishStatus.PROCESSING,
  [VideoTransportPublishStatus.TRANSPORT_PROCESSED]: VideoRequestPublishStatus.PROCESSED,
  [VideoTransportPublishStatus.TRANSPORT_PUBLISHED]: VideoRequestPublishStatus.PUBLISHED,
  [VideoTransportPublishStatus.TRANSPORT_FAILED]: VideoRequestPublishStatus.FAILED,
  [VideoTransportPublishStatus.UNRECOGNIZED]: VideoRequestPublishStatus.FAILED,
};

export { TransportClientVideoPublishEnumMapper };
