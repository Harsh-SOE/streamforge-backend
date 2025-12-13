import { DomainException } from './domain.exception';

export interface InvalidReactionStatusExceptionOptions {
  message?: string;
  meta?: Record<string, any>;
}

export class InvalidReactionStatusException extends DomainException {
  public constructor(options: InvalidReactionStatusExceptionOptions) {
    const { message = `Invalid Reaction status was received`, meta } = options || {};
    super({
      code: 'INVALID_INPUT_EXCEPTION',
      message: message,
      meta,
    });
  }
}
