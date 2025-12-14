import { VideoTransportPublishStatus } from '@app/contracts/videos';

import { VideoRequestPublishStatus } from '../../enums';

const ClientTransportVideoPublishEnumMapper: Record<
  VideoRequestPublishStatus,
  VideoTransportPublishStatus
> = {
  [VideoRequestPublishStatus.PENDING]: VideoTransportPublishStatus.TRANSPORT_PENDING,
  [VideoRequestPublishStatus.PROCESSING]: VideoTransportPublishStatus.TRANSPORT_PROCESSING,
  [VideoRequestPublishStatus.PROCESSED]: VideoTransportPublishStatus.TRANSPORT_PROCESSED,
  [VideoRequestPublishStatus.PUBLISHED]: VideoTransportPublishStatus.TRANSPORT_PUBLISHED,
  [VideoRequestPublishStatus.FAILED]: VideoTransportPublishStatus.TRANSPORT_FAILED,
};
export { ClientTransportVideoPublishEnumMapper };
