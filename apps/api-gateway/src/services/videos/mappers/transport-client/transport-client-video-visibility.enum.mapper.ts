import { VideoTransportVisibilityStatus } from '@app/contracts/videos';

import { VideoRequestVisibilityStatus } from '../../enums';

const TransportClientVideoVisibilityEnumMapper = new Map<
  VideoTransportVisibilityStatus,
  VideoRequestVisibilityStatus
>();

TransportClientVideoVisibilityEnumMapper.set(
  VideoTransportVisibilityStatus.TRANSPORT_PRIVATE,
  VideoRequestVisibilityStatus.PRIVATE,
);
TransportClientVideoVisibilityEnumMapper.set(
  VideoTransportVisibilityStatus.TRANSPORT_PUBLIC,
  VideoRequestVisibilityStatus.PUBLIC,
);
TransportClientVideoVisibilityEnumMapper.set(
  VideoTransportVisibilityStatus.TRANSPORT_UNLISTED,
  VideoRequestVisibilityStatus.UNLISTED,
);

export { TransportClientVideoVisibilityEnumMapper };
