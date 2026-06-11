import { VideoVisibilityState } from '@app/contracts/protocols/videos';

import { VideoRequestVisibilityState } from '../../enums';

const TransportToClientVideoVisibilityMapper: Record<
  VideoVisibilityState,
  VideoRequestVisibilityState
> = {
  [VideoVisibilityState.TRANSPORT_PRIVATE]: VideoRequestVisibilityState.PRIVATE,
  [VideoVisibilityState.TRANSPORT_PUBLIC]: VideoRequestVisibilityState.PUBLIC,
  [VideoVisibilityState.TRANSPORT_UNLISTED]: VideoRequestVisibilityState.UNLISTED,
  [VideoVisibilityState.UNRECOGNIZED]: VideoRequestVisibilityState.PRIVATE,
};

export { TransportToClientVideoVisibilityMapper };
