import { VideoQueryPublishStatus } from '@videos/query-model';

import { VideoPersistancePublishStatus } from '@peristance/videos';

const QueryToPersistancePublishEnumMapper = new Map<
  VideoQueryPublishStatus,
  VideoPersistancePublishStatus
>();

QueryToPersistancePublishEnumMapper.set(
  VideoQueryPublishStatus.PENDING,
  VideoPersistancePublishStatus.PENDING,
);
QueryToPersistancePublishEnumMapper.set(
  VideoQueryPublishStatus.PROCESSING,
  VideoPersistancePublishStatus.PROCESSING,
);
QueryToPersistancePublishEnumMapper.set(
  VideoQueryPublishStatus.PROCESSED,
  VideoPersistancePublishStatus.PROCESSED,
);
QueryToPersistancePublishEnumMapper.set(
  VideoQueryPublishStatus.PUBLISHED,
  VideoPersistancePublishStatus.PUBLISHED,
);
QueryToPersistancePublishEnumMapper.set(
  VideoQueryPublishStatus.FAILED,
  VideoPersistancePublishStatus.FAILED,
);

export { QueryToPersistancePublishEnumMapper };
