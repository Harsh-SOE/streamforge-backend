import { VideoTransportVisibilityStatus } from '@app/contracts/videos';

import { VideoQueryVisibiltyStatus } from '@videos/query-model';

const QueryToTransportVisibilityEnumMapper = new Map<
  VideoQueryVisibiltyStatus,
  VideoTransportVisibilityStatus
>();

QueryToTransportVisibilityEnumMapper.set(
  VideoQueryVisibiltyStatus.PRIVATE,
  VideoTransportVisibilityStatus.TRANSPORT_PRIVATE,
);

QueryToTransportVisibilityEnumMapper.set(
  VideoQueryVisibiltyStatus.PUBLIC,
  VideoTransportVisibilityStatus.TRANSPORT_PUBLIC,
);

QueryToTransportVisibilityEnumMapper.set(
  VideoQueryVisibiltyStatus.UNLISTED,
  VideoTransportVisibilityStatus.TRANSPORT_UNLISTED,
);

export { QueryToTransportVisibilityEnumMapper };
