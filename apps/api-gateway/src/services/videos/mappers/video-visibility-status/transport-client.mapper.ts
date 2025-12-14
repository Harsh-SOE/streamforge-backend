import { VideoTransportVisibilityStatus } from '@app/contracts/videos';

import { VideoRequestVisibilityStatus } from '../../enums';

const TransportClientVideoVisibilityEnumMapper: Record<
  VideoTransportVisibilityStatus,
  VideoRequestVisibilityStatus
> = {
  [VideoTransportVisibilityStatus.TRANSPORT_PRIVATE]: VideoRequestVisibilityStatus.PRIVATE,
  [VideoTransportVisibilityStatus.TRANSPORT_PUBLIC]: VideoRequestVisibilityStatus.PUBLIC,
  [VideoTransportVisibilityStatus.TRANSPORT_UNLISTED]: VideoRequestVisibilityStatus.UNLISTED,
  [VideoTransportVisibilityStatus.UNRECOGNIZED]: VideoRequestVisibilityStatus.PRIVATE,
};

export { TransportClientVideoVisibilityEnumMapper };
