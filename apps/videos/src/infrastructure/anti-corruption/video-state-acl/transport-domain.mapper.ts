import { VideoState } from '@app/contracts/protocols/videos';

import { DomainVideoState } from '@videos/domain/enums';

const TransportToDomainStateEnumMapper: Record<VideoState, DomainVideoState> = {
  [VideoState.TRANSPORT_DRAFT]: DomainVideoState.DRAFT,
  [VideoState.TRANSPORT_PENDING_UPLOAD]: DomainVideoState.PENDING_UPLOAD,
  [VideoState.TRANSPORT_UPLOADED]: DomainVideoState.UPLOADED,
  [VideoState.TRANSPORT_PROCESSING]: DomainVideoState.PROCESSING,
  [VideoState.TRANSPORT_TRANSCODING]: DomainVideoState.TRANSCODING,
  [VideoState.TRANSPORT_READY_TO_PUBLISH]: DomainVideoState.READY_TO_PUBLISH,
  [VideoState.TRANSPORT_PUBLISHED]: DomainVideoState.PUBLISHED,
  [VideoState.TRANSPORT_FAILED]: DomainVideoState.FAILED,
  [VideoState.UNRECOGNIZED]: DomainVideoState.FAILED,
};
export { TransportToDomainStateEnumMapper };
