import { VideoTransportVisibilityStatus } from '@app/contracts/videos';

import { VideoDomainVisibiltyStatus } from '@videos/domain/enums';

const DomainToTransportVisibilityEnumMapper: Record<
  VideoDomainVisibiltyStatus,
  VideoTransportVisibilityStatus
> = {
  [VideoDomainVisibiltyStatus.PRIVATE]: VideoTransportVisibilityStatus.TRANSPORT_PRIVATE,
  [VideoDomainVisibiltyStatus.PUBLIC]: VideoTransportVisibilityStatus.TRANSPORT_PUBLIC,
  [VideoDomainVisibiltyStatus.UNLISTED]: VideoTransportVisibilityStatus.TRANSPORT_UNLISTED,
};

export { DomainToTransportVisibilityEnumMapper };
