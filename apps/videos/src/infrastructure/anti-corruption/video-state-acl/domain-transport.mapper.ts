import { VideoState } from '@app/contracts/protocols/videos';

import { DomainVideoState } from '@videos/domain/enums';

const DomainToTransportStateEnumMapper: Record<DomainVideoState, VideoState> = {
  [DomainVideoState.DRAFT]: VideoState.TRANSPORT_DRAFT,
  [DomainVideoState.UPLOADED]: VideoState.TRANSPORT_UPLOADED,
  [DomainVideoState.PROCESSING]: VideoState.TRANSPORT_PROCESSING,
  [DomainVideoState.READY_TO_PUBLISH]: VideoState.TRANSPORT_READY_TO_PUBLISH,
  [DomainVideoState.PUBLISHED]: VideoState.TRANSPORT_PUBLISHED,
  [DomainVideoState.FAILED]: VideoState.TRANSPORT_FAILED,
};

export { DomainToTransportStateEnumMapper };
