import {
  circuitBreaker,
  CircuitBreakerPolicy,
  CircuitState,
  ConsecutiveBreaker,
  ExponentialBackoff,
  handleWhen,
  IPolicy,
  retry,
  RetryPolicy,
  wrap,
} from 'cockatiel';
import { ReplyError } from 'ioredis';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';

import { Components } from '@app/common';
import {
  BufferConnectionException,
  BufferTimeoutException,
  BufferUnknownException,
  BufferSaveException,
  BufferFlushException,
} from '@app/common/exceptions/payload/buffer-exceptions';
import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';

import { RedisBufferOperationsOptions } from './types';

export interface RedisBufferResillienceConfig {
  maxRetries?: number;
  circuitBreakerThreshold?: number;
  halfOpenAfterMs?: number;
}

export interface RedisBufferHandlerConfig {
  host: string;
  port: number;
  service: string;
  logErrors?: boolean;
  resilienceOptions?: RedisBufferResillienceConfig;
}

export const REDIS_BUFFER_HANDLER_CONFIG = Symbol('REDIS_BUFFER_CONFIG');

@Injectable()
export class RedisBufferHandler implements OnModuleInit {
  private readonly defaultMaxRetries = 3;
  private readonly defaultHalfOpenAfterMs = 10_000;
  private readonly defaultCircuitBreakerThreshold = 10;
  private readonly errorsToHandle = handleWhen((error) => error instanceof ReplyError);

  private retryPolicy: RetryPolicy;
  private circuitPolicy: CircuitBreakerPolicy;
  private policy: IPolicy;

  public constructor(
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
    @Inject(REDIS_BUFFER_HANDLER_CONFIG) private readonly config: RedisBufferHandlerConfig,
  ) {}

  public onModuleInit() {
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

  public retryConfig(): void {
    this.retryPolicy = retry(this.errorsToHandle, {
      maxAttempts: this.config.resilienceOptions?.maxRetries ?? this.defaultMaxRetries,
      backoff: new ExponentialBackoff(),
    });

    this.retryPolicy.onRetry(({ attempt, delay }) => {
      this.logger.alert(
        `Redis operation has failed. Attempt number: ${attempt}. ${attempt ? `Retrying in ${delay}ms` : `All Attempts exhausted, Operation has failed!`}`,
        {
          component: Components.CACHE,
          service: this.config.service,
        },
      );
    });

    this.retryPolicy.onSuccess(({ duration }) =>
      this.logger.alert(`Redis operation completed successfully in ${duration}ms`),
    );
  }

  public circuitConfig(): void {
    this.circuitPolicy = circuitBreaker(this.errorsToHandle, {
      halfOpenAfter: this.config.resilienceOptions?.halfOpenAfterMs ?? this.defaultHalfOpenAfterMs,
      breaker: new ConsecutiveBreaker(
        this.config.resilienceOptions?.circuitBreakerThreshold ??
          this.defaultCircuitBreakerThreshold,
      ),
    });

    this.circuitPolicy.onBreak(() =>
      this.logger.alert('Too many request failed, circuit is now broken', {
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
      this.logger.info('Circuit is now reset', {
        CircuitState: CircuitState.Open,
        component: Components.CACHE,
        service: this.config.service,
      }),
    );
  }

  public async execute<TExecutionResult>(
    operation: () => Promise<TExecutionResult>,
    options: RedisBufferOperationsOptions,
  ): Promise<TExecutionResult> {
    const { operationType, valueToBuffer } = options;
    try {
      return await this.policy.execute(async () => await operation());
    } catch (err) {
      const error = err as Error;

      switch (true) {
        case error instanceof ReplyError: {
          switch (operationType) {
            case 'FLUSH': {
              this.logErrors(`An Error while reading flushing values from redis`, {
                service: this.config.service,
                errorType: error.name ?? error.constructor.name,
                component: Components.CACHE,
                operationType,
              });

              throw new BufferFlushException({
                contextError: error,
                meta: {
                  host: this.config.host,
                  port: this.config.port,
                  errorType: error.name ?? error.constructor.name,
                },
              });
            }

            case 'SAVE': {
              this.logErrors(`Unable to save values in redis`, {
                service: this.config.service,
                errorType: error.name ?? error.constructor.name,
                component: Components.CACHE,
                operationType,
              });
              throw new BufferSaveException({
                contextError: error,
                meta: {
                  valueToBuffer,
                  host: this.config.host,
                  port: this.config.port,
                },
              });
            }

            default: {
              this.logErrors(`An Unknown error occured`, {
                service: this.config.service,
                errorType: error.name ?? error.constructor.name,
                component: Components.CACHE,
                operationType,
              });
              throw new BufferUnknownException({
                operation: operationType,
                contextError: error,
                meta: {
                  valueToBuffer,
                  host: this.config.host,
                  port: this.config.port,
                  errorType: error.name || error.constructor.name,
                },
              });
            }
          }
        }

        case error?.message.includes('ECONNREFUSED'): {
          this.logErrors(`Unable to connect to redis`, {
            service: this.config.service,
            errorType: error.name ?? error.constructor.name,
            component: Components.CACHE,
            operationType,
          });
          throw new BufferConnectionException({
            contextError: error,
            meta: {
              host: this.config.host,
              port: this.config.port,
            },
          });
        }

        case error?.message.includes('ETIMEDOUT'): {
          this.logErrors(`Buffer operation timed out`, {
            service: this.config.service,
            errorType: error.name ?? error.constructor.name,
            component: Components.CACHE,
            operationType,
          });
          throw new BufferTimeoutException({
            contextError: error,
            meta: {
              host: this.config.host,
              port: this.config.port,
            },
          });
        }

        default: {
          if (this.config.logErrors)
            this.logErrors(`An Unknown error occured`, {
              service: this.config.service,
              errorType: error.name ?? error.constructor.name,
              component: Components.CACHE,
              operationType,
            });
          throw new BufferUnknownException({
            operation: operationType,
            contextError: error,
            meta: {
              valueToBuffer,
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
