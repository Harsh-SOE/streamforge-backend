import { ApplicationException } from '@app/common/exceptions/payload/base';

export interface UserNotFoundExceptionOptions {
  message?: string;
  meta?: Record<string, any>;
}

export class UserNotFoundException extends ApplicationException {
  public constructor(options: UserNotFoundExceptionOptions) {
    const { message = `user was not found in the database`, meta } = options || {};
    super({
      code: 'NOT_FOUND_EXCEPTION',
      message: message,
      meta,
    });
  }
}
