import { VideoTransportPublishStatus } from '@app/contracts/videos';

import { VideoRequestPublishStatus } from '../../enums';

const TransportClientVideoPublishEnumMapper = new Map<
  VideoTransportPublishStatus,
  VideoRequestPublishStatus
>();

TransportClientVideoPublishEnumMapper.set(
  VideoTransportPublishStatus.TRANSPORT_PENDING,
  VideoRequestPublishStatus.PENDING,
);
TransportClientVideoPublishEnumMapper.set(
  VideoTransportPublishStatus.TRANSPORT_PROCESSING,
  VideoRequestPublishStatus.PROCESSING,
);
TransportClientVideoPublishEnumMapper.set(
  VideoTransportPublishStatus.TRANSPORT_PROCESSED,
  VideoRequestPublishStatus.PROCESSED,
);
TransportClientVideoPublishEnumMapper.set(
  VideoTransportPublishStatus.TRANSPORT_PUBLISHED,
  VideoRequestPublishStatus.PUBLISHED,
);
TransportClientVideoPublishEnumMapper.set(
  VideoTransportPublishStatus.TRANSPORT_FAILED,
  VideoRequestPublishStatus.FAILED,
);

export { TransportClientVideoPublishEnumMapper };
