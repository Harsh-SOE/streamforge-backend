export enum VIDEO_API {
  PRESIGNED_URL_FOR_VIDEO_FILE = 'video/presign',
  PRESIGNED_URL_FOR_VIDEO_THUMBNAIL = 'thumbnail/presign',
  PUBLISH_VIDEO = 'video',
  FIND_A_VIDEO = 'video/:id',
  UPDATE_A_VIDEO = 'video/meta/:id',
  FIND_ALL_VIDEOS = 'all',
}

export enum VIDEO_API_VERSION {
  V1 = '1',
  V2 = '2',
}
