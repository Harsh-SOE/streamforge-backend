import { DomainException } from '@app/common/exceptions/payload/base';

export interface InvalidVideoThumbnailIdentifierExceptionOptions {
  message?: string;
  meta?: Record<string, any>;
}

export class InvalidVideoThumbnailIndentifierException extends DomainException {
  public constructor(options: InvalidVideoThumbnailIdentifierExceptionOptions) {
    const { message = `Invalid video thumbnail identifier was received`, meta } = options || {};
    super({
      code: 'INVALID_INPUT_EXCEPTION',
      message: message,
      meta,
    });
  }
}
