import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ReplyError } from 'ioredis';
import {
  retry,
  handleAll,
  circuitBreaker,
  wrap,
  ExponentialBackoff,
  ConsecutiveBreaker,
  IPolicy,
  RetryPolicy,
  CircuitBreakerPolicy,
  CircuitState,
} from 'cockatiel';

import { Components } from '@app/common/components';
import { LOGGER_PORT, LoggerPort } from '@app/ports/logger';

import {
  CacheConnectionException,
  CacheReadException,
  CacheUnknownException,
  CacheWriteException,
  CacheTimeoutException,
} from '@app/exceptions/cache-exceptions';

import { RedisOptions } from './types';

@Injectable()
export class RedisCacheHandler implements OnModuleInit {
  private retryPolicy: RetryPolicy;
  private circuitBreakerPolicy: CircuitBreakerPolicy;
  private operationPolicy: IPolicy;

  constructor(@Inject(LOGGER_PORT) private readonly logger: LoggerPort) {}

  public enableRetries(maxRetryAttempts: number) {
    this.retryPolicy = retry(handleAll, {
      maxAttempts: maxRetryAttempts,
      backoff: new ExponentialBackoff(),
    });

    this.retryPolicy.onRetry(() => {
      this.logger.alert('Cache operation has failed, retrying...', {
        component: Components.CACHE,
      });
    });

    this.retryPolicy.onSuccess(() =>
      this.logger.info('Cache operation completed successfully...', {
        component: Components.CACHE,
      }),
    );
  }

  public enableCircuitBreaker(requestBreakerCount: number, allowHalfRequests: number) {
    this.circuitBreakerPolicy = circuitBreaker(handleAll, {
      halfOpenAfter: allowHalfRequests * 1000,
      breaker: new ConsecutiveBreaker(requestBreakerCount),
    });

    this.circuitBreakerPolicy.onBreak(() =>
      this.logger.alert('Too many request failed, Circuit is now Opened', {
        circuitState: CircuitState.Open,
      }),
    );

    this.circuitBreakerPolicy.onHalfOpen(() =>
      this.logger.alert('Allowing only half of the requests to be executed now!', {
        component: Components.CACHE,
        circuitState: CircuitState.HalfOpen,
      }),
    );

    this.circuitBreakerPolicy.onReset(() =>
      this.logger.info('Circuit breaker is now reset!', {
        component: Components.CACHE,
      }),
    );
  }

  onModuleInit() {
    this.enableRetries(3);
    this.enableCircuitBreaker(10, 15);
    this.operationPolicy = wrap(this.retryPolicy, this.circuitBreakerPolicy);
  }

  async execute<TResult, TFallback = never>(
    cacheOperation: () => Promise<TResult> | TResult,
    options: RedisOptions<TFallback>,
  ): Promise<TResult | NonNullable<TFallback>> {
    const {
      host,
      port,
      logErrors = true,
      operationType,
      key,
      keys,
      value,
      values,
      suppressErrors = false,
      fallbackValue,
    } = options || {};

    try {
      return await this.operationPolicy.execute(async () => await cacheOperation());
    } catch (err) {
      if (suppressErrors && fallbackValue) {
        return fallbackValue;
      }
      const error = err as Error;

      switch (true) {
        case error instanceof ReplyError: {
          switch (operationType) {
            case 'READ': {
              if (logErrors)
                this.logger.error(`An Error while reading key:${key} from cahe`, error);

              throw new CacheReadException({
                contextError: error,
                meta: {
                  key,
                  host,
                  port,
                  errorType: error.name,
                },
              });
            }

            case 'READ_MANY': {
              if (logErrors)
                this.logger.error(`An Error while reading key:${keys.join(', ')} from cahe`, {
                  component: Components.CACHE,
                  meta: error,
                });
              throw new CacheWriteException({
                contextError: error,
                meta: {
                  key: keys,
                  host,
                  port,
                  errorType: error.name,
                },
              });
            }

            case 'WRITE': {
              if (logErrors)
                this.logger.error(`Unable to write key:${key} with value:${value} into cache`, {
                  component: Components.CACHE,
                  meta: error,
                });
              throw new CacheWriteException({
                contextError: error,
                meta: {
                  key,
                  value,
                  host,
                  port,
                  errorType: error.name,
                },
              });
            }

            case 'WRITE_MANY': {
              if (logErrors)
                this.logger.error(
                  `Unable to write keys:${keys.join(', ')} with value:${Array.isArray(values) ? values.join(', ') : values} into cache`,
                  { component: Components.CACHE, meta: error },
                );
              throw new CacheWriteException({
                contextError: error,
                meta: {
                  key: keys,
                  value: values,
                  host,
                  port,
                  errorType: error.name,
                },
              });
            }

            default: {
              if (logErrors)
                this.logger.error(`An Unknown error occured`, {
                  component: Components.CACHE,
                  meta: error,
                });
              throw new CacheUnknownException({
                operation: operationType,
                contextError: error,
                meta: {
                  key,
                  value,
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
            this.logger.error(`Unable to connect to cache`, {
              component: Components.CACHE,
              meta: error,
            });
          throw new CacheConnectionException({
            contextError: error,
            meta: {
              host,
              port,
            },
          });
        }

        case error?.message.includes('ETIMEDOUT'): {
          if (logErrors)
            this.logger.error(`Cache operation timed out`, {
              component: Components.CACHE,
              meta: error,
            });
          throw new CacheTimeoutException({
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
              component: Components.CACHE,
              meta: error,
            });
          throw new CacheUnknownException({
            operation: operationType,
            contextError: error,
            meta: {
              key,
              value,
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
