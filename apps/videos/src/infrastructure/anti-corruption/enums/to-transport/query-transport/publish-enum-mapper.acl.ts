import { VideoTransportPublishStatus } from '@app/contracts/videos';

import { VideoQueryPublishStatus } from '@videos/query-model';

const QueryToTransportPublishEnumMapper = new Map<
  VideoQueryPublishStatus,
  VideoTransportPublishStatus
>();

QueryToTransportPublishEnumMapper.set(
  VideoQueryPublishStatus.PENDING,
  VideoTransportPublishStatus.TRANSPORT_PENDING,
);

QueryToTransportPublishEnumMapper.set(
  VideoQueryPublishStatus.PROCESSING,
  VideoTransportPublishStatus.TRANSPORT_PROCESSING,
);

QueryToTransportPublishEnumMapper.set(
  VideoQueryPublishStatus.PROCESSED,
  VideoTransportPublishStatus.TRANSPORT_PROCESSED,
);

QueryToTransportPublishEnumMapper.set(
  VideoQueryPublishStatus.PUBLISHED,
  VideoTransportPublishStatus.TRANSPORT_PUBLISHED,
);

QueryToTransportPublishEnumMapper.set(
  VideoQueryPublishStatus.FAILED,
  VideoTransportPublishStatus.TRANSPORT_FAILED,
);

export { QueryToTransportPublishEnumMapper };
