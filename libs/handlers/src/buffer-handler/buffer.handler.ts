import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import {
  circuitBreaker,
  CircuitBreakerPolicy,
  CircuitState,
  ConsecutiveBreaker,
  ExponentialBackoff,
  handleAll,
  IPolicy,
  retry,
  RetryPolicy,
  wrap,
} from 'cockatiel';
import { ReplyError } from 'ioredis';

import {
  BufferConnectionException,
  BufferTimeoutException,
  BufferUnknownException,
  BufferSaveException,
  BufferFlushException,
} from '@app/exceptions/buffer-exceptions';
import { Components } from '@app/common/components';
import { LOGGER_PORT, LoggerPort } from '@app/ports/logger';

import { BufferFilterOptions } from './types';

@Injectable()
export class RedisBufferHandler implements OnModuleInit, OnModuleDestroy {
  private retryPolicy: RetryPolicy;
  private circuitBreakerPolicy: CircuitBreakerPolicy;
  private operationPolicy: IPolicy;

  public constructor(@Inject(LOGGER_PORT) private logger: LoggerPort) {}

  public onModuleInit() {
    this.retryPolicyConfig(3);
    this.circuitBreakerConfig(10, 15);
    this.operationPolicy = wrap(this.retryPolicy, this.circuitBreakerPolicy);
  }

  public onModuleDestroy() {}

  public retryPolicyConfig(maxRetries: number): void {
    this.retryPolicy = retry(handleAll, {
      maxAttempts: maxRetries,
      backoff: new ExponentialBackoff(),
    });

    this.retryPolicy.onRetry(() => {
      this.logger.alert('Buffer operation has failed, retrying...', {
        component: Components.BUFFER,
      });
    });

    this.retryPolicy.onSuccess(() =>
      this.logger.info('Buffer operation completed successfully', {
        component: Components.BUFFER,
      }),
    );
  }

  public circuitBreakerConfig(allowHalfRequest: number, maxRequestFailureBreaker: number): void {
    this.circuitBreakerPolicy = circuitBreaker(handleAll, {
      halfOpenAfter: allowHalfRequest * 1000,
      breaker: new ConsecutiveBreaker(maxRequestFailureBreaker),
    });

    this.circuitBreakerPolicy.onBreak(() =>
      this.logger.alert('Too many request failed, Circuit is now Opened', {
        circuitState: CircuitState.Open,
      }),
    );

    this.circuitBreakerPolicy.onHalfOpen(() =>
      this.logger.alert('Allowing only half of the requests to be executed now!', {
        component: Components.BUFFER,
        circuitState: CircuitState.HalfOpen,
      }),
    );

    this.circuitBreakerPolicy.onReset(() =>
      this.logger.info('Circuit breaker is now reset!', {
        component: Components.BUFFER,
      }),
    );
  }

  public async filter<TResult, TFallback = never>(
    infrastructureOperation: () => Promise<TResult>,
    bufferFilter: BufferFilterOptions<TFallback>,
  ): Promise<TResult | NonNullable<TFallback>> {
    const { host, port, suppressErrors, fallbackValue, logErrors, operationType, valueToBuffer } =
      bufferFilter || {};
    try {
      return await this.operationPolicy.execute(async () => await infrastructureOperation());
    } catch (err) {
      if (suppressErrors && fallbackValue) {
        return fallbackValue;
      }
      const error = err as Error;

      switch (true) {
        case error instanceof ReplyError: {
          switch (operationType) {
            case 'FLUSH': {
              if (logErrors)
                this.logger.error(`An Error while reading flushing values from buffer`, error);

              throw new BufferFlushException({
                contextError: error,
                meta: {
                  host,
                  port,
                  errorType: error.name,
                },
              });
            }

            case 'SAVE': {
              if (logErrors)
                this.logger.error(`Unable to save values in buffer`, {
                  component: Components.CACHE,
                  meta: error,
                });
              throw new BufferSaveException({
                contextError: error,
                meta: {
                  valueToBuffer,
                  host,
                  port,
                },
              });
            }

            default: {
              if (logErrors)
                this.logger.error(`An Unknown error occured`, {
                  component: Components.BUFFER,
                  meta: error,
                });
              throw new BufferUnknownException({
                operation: operationType,
                contextError: error,
                meta: {
                  valueToBuffer,
                  host,
                  port,
                  errorType: error.name || error.constructor.name,
                },
              });
            }
          }
        }

        case error?.message.includes('ECONNREFUSED'): {
          if (logErrors)
            this.logger.error(`Unable to connect to buffer`, {
              component: Components.BUFFER,
              meta: error,
            });
          throw new BufferConnectionException({
            contextError: error,
            meta: {
              host,
              port,
            },
          });
        }

        case error?.message.includes('ETIMEDOUT'): {
          if (logErrors)
            this.logger.error(`Buffer operation timed out`, {
              component: Components.BUFFER,
              meta: error,
            });
          throw new BufferTimeoutException({
            contextError: error,
            meta: {
              host,
              port,
            },
          });
        }

        default: {
          if (logErrors)
            this.logger.error(`An Unknown error occured`, {
              component: Components.BUFFER,
              meta: error,
            });
          throw new BufferUnknownException({
            operation: operationType,
            contextError: error,
            meta: {
              valueToBuffer,
              host,
              port,
              errorType: error.name || error.constructor.name,
            },
          });
        }
      }
    }
  }
}
