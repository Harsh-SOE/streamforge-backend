import { VideoTransportVisibilityStatus } from '@app/contracts/videos';
import { VideoRequestVisibilityStatus } from '../../enums';

const ClientTransportVideoVisibilityEnumMapper = new Map<
  VideoRequestVisibilityStatus,
  VideoTransportVisibilityStatus
>();

ClientTransportVideoVisibilityEnumMapper.set(
  VideoRequestVisibilityStatus.PRIVATE,
  VideoTransportVisibilityStatus.TRANSPORT_PRIVATE,
);
ClientTransportVideoVisibilityEnumMapper.set(
  VideoRequestVisibilityStatus.PUBLIC,
  VideoTransportVisibilityStatus.TRANSPORT_PUBLIC,
);
ClientTransportVideoVisibilityEnumMapper.set(
  VideoRequestVisibilityStatus.UNLISTED,
  VideoTransportVisibilityStatus.TRANSPORT_UNLISTED,
);

export { ClientTransportVideoVisibilityEnumMapper };
