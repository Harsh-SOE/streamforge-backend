import { VideoQueryPublishStatus } from '@videos/query-model';

import { VideoPersistancePublishStatus } from '@peristance/videos';

const PersistanceToQueryPublishEnumMapper = new Map<
  VideoPersistancePublishStatus,
  VideoQueryPublishStatus
>();

PersistanceToQueryPublishEnumMapper.set(
  VideoPersistancePublishStatus.PENDING,
  VideoQueryPublishStatus.PENDING,
);
PersistanceToQueryPublishEnumMapper.set(
  VideoPersistancePublishStatus.PROCESSING,
  VideoQueryPublishStatus.PROCESSING,
);
PersistanceToQueryPublishEnumMapper.set(
  VideoPersistancePublishStatus.PROCESSED,
  VideoQueryPublishStatus.PROCESSED,
);
PersistanceToQueryPublishEnumMapper.set(
  VideoPersistancePublishStatus.PUBLISHED,
  VideoQueryPublishStatus.PUBLISHED,
);
PersistanceToQueryPublishEnumMapper.set(
  VideoPersistancePublishStatus.FAILED,
  VideoQueryPublishStatus.FAILED,
);

export { PersistanceToQueryPublishEnumMapper };
