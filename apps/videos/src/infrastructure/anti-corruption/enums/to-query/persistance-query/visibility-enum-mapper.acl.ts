import { VideoQueryVisibiltyStatus } from '@videos/query-model';

import { VideoPersistanceVisibilityStatus } from '@peristance/videos';

const PersistanceToQueryVisibilityEnumMapper = new Map<
  VideoPersistanceVisibilityStatus,
  VideoQueryVisibiltyStatus
>();

PersistanceToQueryVisibilityEnumMapper.set(
  VideoPersistanceVisibilityStatus.PRIVATE,
  VideoQueryVisibiltyStatus.PRIVATE,
);
PersistanceToQueryVisibilityEnumMapper.set(
  VideoPersistanceVisibilityStatus.PUBLIC,
  VideoQueryVisibiltyStatus.PUBLIC,
);
PersistanceToQueryVisibilityEnumMapper.set(
  VideoPersistanceVisibilityStatus.UNLISTED,
  VideoQueryVisibiltyStatus.UNLISTED,
);

export { PersistanceToQueryVisibilityEnumMapper };
