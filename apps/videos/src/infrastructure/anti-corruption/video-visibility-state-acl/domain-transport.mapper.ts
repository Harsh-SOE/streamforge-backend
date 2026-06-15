import { VideoVisibilityState } from '@app/contracts/protocols/videos';

import { DomainVideoVisibiltyState } from '@videos/domain/enums';

const DomainToTransportVisibilityEnumMapper: Record<
  DomainVideoVisibiltyState,
  VideoVisibilityState
> = {
  [DomainVideoVisibiltyState.PRIVATE]: VideoVisibilityState.TRANSPORT_PRIVATE,
  [DomainVideoVisibiltyState.PUBLIC]: VideoVisibilityState.TRANSPORT_PUBLIC,
  [DomainVideoVisibiltyState.UNLISTED]: VideoVisibilityState.TRANSPORT_UNLISTED,
};

export { DomainToTransportVisibilityEnumMapper };
