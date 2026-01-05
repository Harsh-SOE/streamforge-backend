import { ApplicationException } from '@app/common/exceptions/payload/base';

export interface VideoNotFoundExceptionOptions {
  message?: string;
  meta?: Record<string, any>;
}

export class VideoNotFoundException extends ApplicationException {
  public constructor(options: VideoNotFoundExceptionOptions) {
    const { message = `user was not found in the database`, meta } = options || {};
    super({
      code: 'NOT_FOUND_EXCEPTION',
      message: message,
      meta,
    });
  }
}
