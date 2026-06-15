import { VideoVisibilityState } from '@app/contracts/protocols/videos';

import { DomainVideoVisibiltyState } from '@videos/domain/enums';

const TransportToDomainVisibilityEnumMapper: Record<
  VideoVisibilityState,
  DomainVideoVisibiltyState
> = {
  [VideoVisibilityState.TRANSPORT_PRIVATE]: DomainVideoVisibiltyState.PRIVATE,
  [VideoVisibilityState.TRANSPORT_PUBLIC]: DomainVideoVisibiltyState.PUBLIC,
  [VideoVisibilityState.TRANSPORT_UNLISTED]: DomainVideoVisibiltyState.UNLISTED,
  [VideoVisibilityState.UNRECOGNIZED]: DomainVideoVisibiltyState.PRIVATE,
};

export { TransportToDomainVisibilityEnumMapper };
