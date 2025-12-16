import { VideoTransportVisibilityStatus } from '@app/contracts/videos';

import { VideoDomainVisibiltyStatus } from '@videos/domain/enums';

const TransportToDomainVisibilityEnumMapper: Record<
  VideoTransportVisibilityStatus,
  VideoDomainVisibiltyStatus
> = {
  [VideoTransportVisibilityStatus.TRANSPORT_PRIVATE]: VideoDomainVisibiltyStatus.PRIVATE,
  [VideoTransportVisibilityStatus.TRANSPORT_PUBLIC]: VideoDomainVisibiltyStatus.PUBLIC,
  [VideoTransportVisibilityStatus.TRANSPORT_UNLISTED]: VideoDomainVisibiltyStatus.UNLISTED,
  [VideoTransportVisibilityStatus.UNRECOGNIZED]: VideoDomainVisibiltyStatus.PRIVATE,
};

export { TransportToDomainVisibilityEnumMapper };
