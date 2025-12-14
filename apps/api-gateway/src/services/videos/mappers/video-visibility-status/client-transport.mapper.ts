import { VideoTransportVisibilityStatus } from '@app/contracts/videos';

import { VideoRequestVisibilityStatus } from '../../enums';

const ClientTransportVideoVisibilityEnumMapper: Record<
  VideoRequestVisibilityStatus,
  VideoTransportVisibilityStatus
> = {
  [VideoRequestVisibilityStatus.PRIVATE]: VideoTransportVisibilityStatus.TRANSPORT_PRIVATE,
  [VideoRequestVisibilityStatus.PUBLIC]: VideoTransportVisibilityStatus.TRANSPORT_PUBLIC,
  [VideoRequestVisibilityStatus.UNLISTED]: VideoTransportVisibilityStatus.TRANSPORT_UNLISTED,
};

export { ClientTransportVideoVisibilityEnumMapper };
