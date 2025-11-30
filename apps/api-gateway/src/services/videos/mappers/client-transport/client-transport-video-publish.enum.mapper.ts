import { VideoTransportPublishStatus } from '@app/contracts/videos';

import { VideoRequestPublishStatus } from '../../enums';

const ClientTransportVideoPublishEnumMapper = new Map<
  VideoRequestPublishStatus,
  VideoTransportPublishStatus
>();

ClientTransportVideoPublishEnumMapper.set(
  VideoRequestPublishStatus.PENDING,
  VideoTransportPublishStatus.TRANSPORT_PENDING,
);
ClientTransportVideoPublishEnumMapper.set(
  VideoRequestPublishStatus.PROCESSING,
  VideoTransportPublishStatus.TRANSPORT_PROCESSING,
);
ClientTransportVideoPublishEnumMapper.set(
  VideoRequestPublishStatus.PROCESSED,
  VideoTransportPublishStatus.TRANSPORT_PROCESSED,
);
ClientTransportVideoPublishEnumMapper.set(
  VideoRequestPublishStatus.PUBLISHED,
  VideoTransportPublishStatus.TRANSPORT_PUBLISHED,
);
ClientTransportVideoPublishEnumMapper.set(
  VideoRequestPublishStatus.FAILED,
  VideoTransportPublishStatus.TRANSPORT_FAILED,
);

export { ClientTransportVideoPublishEnumMapper };
