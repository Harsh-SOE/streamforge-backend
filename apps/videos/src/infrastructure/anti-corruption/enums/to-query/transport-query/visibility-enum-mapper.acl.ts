import { VideoTransportVisibilityStatus } from '@app/contracts/videos';

import { VideoQueryVisibiltyStatus } from '@videos/query-model';

const TransportToQueryVisibilityEnumMapper = new Map<
  VideoTransportVisibilityStatus,
  VideoQueryVisibiltyStatus
>();

TransportToQueryVisibilityEnumMapper.set(
  VideoTransportVisibilityStatus.TRANSPORT_PRIVATE,
  VideoQueryVisibiltyStatus.PRIVATE,
);

TransportToQueryVisibilityEnumMapper.set(
  VideoTransportVisibilityStatus.TRANSPORT_PUBLIC,
  VideoQueryVisibiltyStatus.PUBLIC,
);

TransportToQueryVisibilityEnumMapper.set(
  VideoTransportVisibilityStatus.TRANSPORT_UNLISTED,
  VideoQueryVisibiltyStatus.UNLISTED,
);

export { TransportToQueryVisibilityEnumMapper };
