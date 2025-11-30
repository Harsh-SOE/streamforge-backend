import { VideoTransportPublishStatus } from '@app/contracts/videos';

import { VideoQueryPublishStatus } from '@videos/query-model';

const TransportToQueryPublishEnumMapper = new Map<
  VideoTransportPublishStatus,
  VideoQueryPublishStatus
>();

TransportToQueryPublishEnumMapper.set(
  VideoTransportPublishStatus.TRANSPORT_PENDING,
  VideoQueryPublishStatus.PENDING,
);

TransportToQueryPublishEnumMapper.set(
  VideoTransportPublishStatus.TRANSPORT_PROCESSING,
  VideoQueryPublishStatus.PROCESSING,
);

TransportToQueryPublishEnumMapper.set(
  VideoTransportPublishStatus.TRANSPORT_PROCESSED,
  VideoQueryPublishStatus.PROCESSED,
);

TransportToQueryPublishEnumMapper.set(
  VideoTransportPublishStatus.TRANSPORT_PUBLISHED,
  VideoQueryPublishStatus.PUBLISHED,
);

TransportToQueryPublishEnumMapper.set(
  VideoTransportPublishStatus.TRANSPORT_FAILED,
  VideoQueryPublishStatus.FAILED,
);

export { TransportToQueryPublishEnumMapper };
