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
  handleWhen,
} from 'cockatiel';
import { ReplyError } from 'ioredis';
import { Inject, Injectable } from '@nestjs/common';

import { Components } from '@app/common';
import {
  CacheConnectionException,
  CacheReadException,
  CacheUnknownException,
  CacheWriteException,
  CacheTimeoutException,
} from '@app/common/exceptions/payload/cache-exceptions';
import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';

import { RedisCacheOperationsOptions } from './types';

export interface RedisCacheResillienceConfig {
  maxRetries?: number;
  circuitBreakerThreshold?: number;
  halfOpenAfterMs?: number;
}

export interface RedisCacheHandlerConfig {
  host: string;
  port: number;
  service: string;
  logErrors?: boolean;
  resilienceOptions?: RedisCacheResillienceConfig;
}

export const REDIS_CACHE_HANDLER_CONFIG = Symbol('REDIS_CACHE_HANDLER_CONFIG');

@Injectable()
export class RedisCacheHandler {
  private readonly defaultMaxRetries = 3;
  private readonly defaultHalfOpenAfterMs = 10_000;
  private readonly defaultCircuitBreakerThreshold = 10;
  private readonly errorsToHandle = handleWhen((error) => error instanceof ReplyError);

  private retryPolicy: RetryPolicy;
  private circuitPolicy: CircuitBreakerPolicy;
  private policy: IPolicy;

  constructor(
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
    @Inject(REDIS_CACHE_HANDLER_CONFIG) private readonly config: RedisCacheHandlerConfig,
  ) {
    this.retryConfig();
    this.circuitConfig();
    this.policy = wrap(this.retryPolicy, this.circuitPolicy);
  }

  private logErrors(message: string, info: Record<string, any>) {
    if (!this.config.logErrors) {
      return;
    }
    this.logger.error(message, { ...info });
  }

  public retryConfig() {
    this.retryPolicy = retry(this.errorsToHandle, {
      maxAttempts: this.config.resilienceOptions?.maxRetries ?? this.defaultMaxRetries,
      backoff: new ExponentialBackoff(),
    });

    this.retryPolicy.onRetry(({ attempt, delay }) => {
      this.logger.error(
        `Redis cache operation has failed. Attempt number: ${attempt}. ${attempt ? `Retrying in ${delay}ms` : `All Attempts exhausted, Operation has failed!`}`,
        {
          component: Components.CACHE,
          service: this.config.service,
        },
      );
    });

    this.retryPolicy.onSuccess(({ duration }) =>
      this.logger.alert(`Redis cache operation completed successfully in ${duration}ms`),
    );
  }

  public circuitConfig() {
    this.circuitPolicy = circuitBreaker(handleAll, {
      halfOpenAfter: this.config.resilienceOptions?.halfOpenAfterMs ?? this.defaultHalfOpenAfterMs,
      breaker: new ConsecutiveBreaker(
        this.config.resilienceOptions?.circuitBreakerThreshold ??
          this.defaultCircuitBreakerThreshold,
      ),
    });

    this.circuitPolicy.onBreak(() =>
      this.logger.alert('Too many requests failed, circuit is now broken', {
        circuitState: CircuitState.Open,
        component: Components.CACHE,
        service: this.config.service,
      }),
    );

    this.circuitPolicy.onHalfOpen(() =>
      this.logger.alert('Cicuit will now allow only half of the requests to pass through.', {
        circuitState: CircuitState.HalfOpen,
        component: Components.CACHE,
        service: this.config.service,
      }),
    );

    this.circuitPolicy.onReset(() =>
      this.logger.info('Circuit breaker is now reset!', {
        component: Components.CACHE,
        circuitState: CircuitState.Isolated,
        service: this.config.service,
      }),
    );
  }

  async execute<TExecutionResult>(
    cacheOperation: () => TExecutionResult | Promise<TExecutionResult>,
    options: RedisCacheOperationsOptions,
  ): Promise<TExecutionResult> {
    const { operationType, key, keys, value, values } = options || {};

    try {
      return await this.policy.execute(async () => await cacheOperation());
    } catch (err) {
      const error = err as Error;

      switch (true) {
        case error instanceof ReplyError: {
          switch (operationType) {
            case 'READ': {
              this.logErrors(`An Error while reading key:${key} from cahe`, error);

              throw new CacheReadException({
                contextError: error,
                meta: {
                  key,
                  host: this.config.host,
                  port: this.config.port,
                  errorType: error.name,
                },
              });
            }

            case 'READ_MANY': {
              this.logErrors(`An Error while reading key:${keys.join(', ')} from cahe`, {
                component: Components.CACHE,
                meta: error,
              });
              throw new CacheWriteException({
                contextError: error,
                meta: {
                  key: keys,
                  host: this.config.host,
                  port: this.config.port,
                  errorType: error.name,
                },
              });
            }

            case 'WRITE': {
              this.logErrors(`Unable to write key:${key} with value:${value} into cache`, {
                component: Components.CACHE,
                meta: error,
              });
              throw new CacheWriteException({
                contextError: error,
                meta: {
                  key,
                  value,
                  host: this.config.host,
                  port: this.config.port,
                  errorType: error.name,
                },
              });
            }

            case 'WRITE_MANY': {
              this.logErrors(
                `Unable to write keys:${keys.join(', ')} with value:${Array.isArray(values) ? values.join(', ') : values} into cache`,
                { component: Components.CACHE, meta: error },
              );
              throw new CacheWriteException({
                contextError: error,
                meta: {
                  key: keys,
                  value: values,
                  host: this.config.host,
                  port: this.config.port,
                  errorType: error.name,
                },
              });
            }

            default: {
              this.logErrors(`An Unknown error occured`, {
                component: Components.CACHE,
                meta: error,
              });
              throw new CacheUnknownException({
                operation: operationType,
                contextError: error,
                meta: {
                  key,
                  value,
                  host: this.config.host,
                  port: this.config.port,
                  errorType: error.name || error.constructor.name,
                },
              });
            }
          }
        }

        case error?.message.includes('ECONNREFUSED'): {
          this.logErrors(`Unable to connect to cache`, {
            component: Components.CACHE,
            meta: error,
          });
          throw new CacheConnectionException({
            contextError: error,
            meta: {
              host: this.config.host,
              port: this.config.port,
            },
          });
        }

        case error?.message.includes('ETIMEDOUT'): {
          this.logErrors(`Cache operation timed out`, {
            component: Components.CACHE,
            meta: error,
          });
          throw new CacheTimeoutException({
            contextError: error,
            meta: {
              host: this.config.host,
              port: this.config.port,
            },
          });
        }

        default: {
          this.logErrors(`An Unknown error occured`, {
            component: Components.CACHE,
            meta: error,
          });
          throw new CacheUnknownException({
            operation: operationType,
            contextError: error,
            meta: {
              key,
              value,
              host: this.config.host,
              port: this.config.port,
              errorType: error.name || error.constructor.name,
            },
          });
        }
      }
    }
  }
}
