import { VideoQueryVisibiltyStatus } from '@videos/query-model';

import { VideoPersistanceVisibilityStatus } from '@peristance/videos';

const QueryToPersistanceVisibilityEnumMapper = new Map<
  VideoQueryVisibiltyStatus,
  VideoPersistanceVisibilityStatus
>();

QueryToPersistanceVisibilityEnumMapper.set(
  VideoQueryVisibiltyStatus.PRIVATE,
  VideoPersistanceVisibilityStatus.PRIVATE,
);
QueryToPersistanceVisibilityEnumMapper.set(
  VideoQueryVisibiltyStatus.PUBLIC,
  VideoPersistanceVisibilityStatus.PUBLIC,
);
QueryToPersistanceVisibilityEnumMapper.set(
  VideoQueryVisibiltyStatus.UNLISTED,
  VideoPersistanceVisibilityStatus.UNLISTED,
);

export { QueryToPersistanceVisibilityEnumMapper };
