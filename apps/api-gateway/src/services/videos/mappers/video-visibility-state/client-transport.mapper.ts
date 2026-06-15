import { VideoVisibilityState } from '@app/contracts/protocols/videos';

import { VideoRequestVisibilityState } from '../../enums';

const ClientToTransportVideoVisibilityMapper: Record<
  VideoRequestVisibilityState,
  VideoVisibilityState
> = {
  [VideoRequestVisibilityState.PRIVATE]: VideoVisibilityState.TRANSPORT_PRIVATE,
  [VideoRequestVisibilityState.PUBLIC]: VideoVisibilityState.TRANSPORT_PUBLIC,
  [VideoRequestVisibilityState.UNLISTED]: VideoVisibilityState.TRANSPORT_UNLISTED,
};

export { ClientToTransportVideoVisibilityMapper };
