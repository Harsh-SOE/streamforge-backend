export enum USERS_EVENTS {
  USER_ONBOARDED_EVENT = 'users.onboarded',
  USER_PROFILE_UPDATED_EVENT = 'users.profile-updated',
  USER_PHONE_NUMBER_UPDATED_EVENT = 'users.phone-number-updated',
  USER_THEME_CHANGED_EVENT = 'users.theme-changed',
  USER_NOTIFICATION_CHANGED_EVENT = 'users.notification-changed',
  USER_LANGUAGE_CHANGED_EVENT = 'users.language-changed',
}

export enum VIDEO_EVENTS {
  VIDEO_UPLOADED_EVENT = 'video.uploaded',
  VIDEO_PUBLISHED_EVENT = 'video.published',
}

export enum CHANNEL_EVENTS {
  CHANNEL_CREATED = 'channel.created',
  CHANNEL_MONITIZED = 'channel.monitized',
  CHANNEL_UPDATED = 'channel.updated',
}

export enum COMMENT_EVENTS {
  COMMENT_CREATED = 'comment.created',
}

export enum VIDEO_TRANSCODER_EVENTS {
  VIDEO_TRANSCODE_EVENT = 'video.transcode',
  VIDEO_TRANSCODED_EVENT = 'video.transcoded',
}

export enum PROJECTION_EVENTS {
  SAVE_USER_EVENT = 'user.save-user-event',
  SAVE_VIDEO_EVENT = 'video.save-video-event',
}

export enum BUFFER_EVENTS {
  COMMENT_BUFFER_EVENT = 'comments.buffer',
  REACTION_BUFFER_EVENT = 'reactions.buffer',
  USER_BUFFER_EVENT = 'users.buffer',
  VIDEOS_BUFFER_EVENT = 'videos.buffer',
  VIEWS_BUFFER_EVENT = 'views.buffer',
}
