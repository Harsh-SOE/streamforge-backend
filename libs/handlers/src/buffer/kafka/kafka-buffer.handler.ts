import {
  KafkaJSConnectionError,
  KafkaJSNumberOfRetriesExceeded,
  KafkaJSRequestTimeoutError,
} from 'kafkajs';
import {
  circuitBreaker,
  ConsecutiveBreaker,
  ExponentialBackoff,
  handleWhen,
  IPolicy,
  retry,
  wrap,
} from 'cockatiel';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';

import { Components } from '@app/common';
import {
  BufferConnectionException,
  BufferTimeoutException,
  BufferUnknownException,
} from '@app/common/exceptions/payload/buffer-exceptions';
import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';

import { KafkaBufferOperationsOptions } from './types';

export interface KafkaBufferResilienceConfig {
  maxRetries?: number;
  circuitBreakerThreshold?: number;
  halfOpenAfterMs?: number;
}

export interface KafkaBufferHandlerConfig {
  host: string;
  port: number;
  service: string;
  logErrors?: boolean;
  resilienceOptions?: KafkaBufferResilienceConfig;
}

export const KAFKA_BUFFER_HANDLER_CONFIG = Symbol('KAFKA_BUFFER_HANDLER_CONFIG');

@Injectable()
export class KafkaBufferHandler implements OnModuleInit {
  private maxRetries = 3;
  private halfOpenAfterMs = 10_000;
  private circuitBreakerThreshold = 10;

  private readonly errorsToHandle = handleWhen((error) => {
    if (!error) return false;

    if (
      error instanceof KafkaJSConnectionError ||
      error instanceof KafkaJSRequestTimeoutError ||
      error instanceof KafkaJSNumberOfRetriesExceeded
    ) {
      return true;
    }

    if (this.isNetworkError(error)) {
      return true;
    }

    return false;
  });

  private policy: IPolicy;

  public onModuleInit() {
    const retryPolicy = retry(this.errorsToHandle, {
      maxAttempts: this.maxRetries,
      backoff: new ExponentialBackoff(),
    });

    const circuitConfig = circuitBreaker(this.errorsToHandle, {
      halfOpenAfter: this.halfOpenAfterMs,
      breaker: new ConsecutiveBreaker(this.circuitBreakerThreshold),
    });

    this.policy = wrap(retryPolicy, circuitConfig);

    this.policy.onSuccess(({ duration }) =>
      this.logger.alert(`Redis operation completed successfully in ${duration}ms`),
    );

    this.policy.onFailure(({ duration, reason, handled }) =>
      this.logger.error(`Redis operation failed after ${duration}ms`, {
        component: Components.BUFFER,
        reason,
        handled,
        service: this.config.service,
      }),
    );
  }

  private logErrors(message: string, info: Record<string, any>) {
    if (!this.config.logErrors) {
      return;
    }
    this.logger.error(message, { ...info });
  }

  private isNetworkError(error: any) {
    if (!error) return false;
    return (
      typeof error === 'object' &&
      error instanceof Error &&
      'code' in error &&
      typeof error.code === 'string' &&
      ['ECONNRESET', 'ECONNREFUSED', 'ENOTFOUND', 'EHOSTUNREACH', 'ETIMEDOUT'].includes(error.code)
    );
  }

  public constructor(
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
    @Inject(KAFKA_BUFFER_HANDLER_CONFIG)
    private readonly config: KafkaBufferHandlerConfig,
  ) {
    this.maxRetries = this.config.resilienceOptions?.maxRetries ?? this.maxRetries;
    this.halfOpenAfterMs = this.config.resilienceOptions?.halfOpenAfterMs ?? this.halfOpenAfterMs;
    this.circuitBreakerThreshold =
      this.config.resilienceOptions?.circuitBreakerThreshold ?? this.circuitBreakerThreshold;
  }

  public async execute<TExecutionResult>(
    operation: () => TExecutionResult | Promise<TExecutionResult>,
    options: KafkaBufferOperationsOptions,
  ): Promise<TExecutionResult> {
    const { operationType, valueToBuffer } = options;

    try {
      return await this.policy.execute(async () => {
        return await operation();
      });
    } catch (OpError) {
      const error = OpError as Error;
      switch (true) {
        case error instanceof KafkaJSConnectionError: {
          this.logErrors(`Unable to connect to message broker`, {
            error,
            operationType,
            valueToBuffer,
          });

          throw new BufferConnectionException({
            message: `Unable to connect to kafka broker`,
            contextError: error as Error,
            meta: {
              host: this.config.host,
              port: this.config.port,
            },
          });
        }

        case error instanceof KafkaJSRequestTimeoutError: {
          this.logErrors(`Message broker request timed out`, {
            error,
            operationType,
            valueToBuffer,
          });

          throw new BufferTimeoutException({
            message: `Request timed out for kafka broker`,
            contextError: error,
            meta: {
              host: this.config.host,
              port: this.config.port,
            },
          });
        }

        case this.isNetworkError(error): {
          this.logErrors('Network error while talking to kafka', {
            error,
            operationType,
            valueToBuffer,
          });

          throw new BufferConnectionException({
            message: `Network error while talking to kafka`,
            contextError: error,
            meta: { host: this.config.host, port: this.config.port },
          });
        }

        default: {
          this.logErrors(`Unknown message broker error occured`, {
            error,
            operationType,
            valueToBuffer,
          });

          throw new BufferUnknownException({
            message: `An unknown error occured while executing kafka operation`,
            contextError: error,
            meta: {
              host: this.config.host,
              port: this.config.port,
            },
          });
        }
      }
    }
  }
}
