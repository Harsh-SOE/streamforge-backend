import { DomainException } from '@app/common/exceptions/payload/base';

export interface InvalidCommentTextExceptionOptions {
  message?: string;
  meta?: Record<string, any>;
}

export class InvalidCommentTextException extends DomainException {
  public constructor(options: InvalidCommentTextExceptionOptions) {
    const { message = `Invalid comemnt text was received`, meta } = options || {};
    super({
      code: 'INVALID_INPUT_EXCEPTION',
      message: message,
      meta,
    });
  }
}
