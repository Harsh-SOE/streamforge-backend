import { DomainException } from '@app/common/exceptions/payload/base';

export interface InvalidVideoStateTransitionExceptionOptions {
  message?: string;
  meta?: Record<string, unknown>;
}

export class InvalidVideoStateTransitionException extends DomainException {
  public constructor(options: InvalidVideoStateTransitionExceptionOptions) {
    const { message = 'Invalid video state transition was requested', meta } = options || {};

    super({
      code: 'INVALID_VIDEO_STATE_TRANSITION_EXCEPTION',
      message,
      meta,
    });
  }
}
