import {
  Message,
  IHeaders,
  KafkaJSConnectionError,
  KafkaJSRequestTimeoutError,
  KafkaJSNumberOfRetriesExceeded,
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
  EventBusConnectionException,
  EventBusTimeoutException,
  EventBusUnknownException,
} from '@app/common/exceptions/payload/event-bus-exceptions';
import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';
import { ApplicationException, DomainException } from '@app/common/exceptions/payload/base';

import type { KafkaConsumerOperationOptions } from '../types';

export interface KafkaEventConsumerResilienceConfig {
  maxRetries?: number;
  circuitBreakerThreshold?: number;
  halfOpenAfterMs?: number;
}

export interface KafkaEventConsumerHandlerConfig {
  host: string;
  port: number;
  service: string;
  logErrors?: boolean;

  enableDlq?: boolean;
  dlqTopic?: string;
  sendToDlqAfterAttempts?: number;
  dlqOnDomainException?: boolean;
  dlqOnApplicationException?: boolean;

  resilienceOptions?: KafkaEventConsumerResilienceConfig;
}

export const KAFKA_EVENT_CONSUMER_HANDLER_CONFIG = Symbol('KAFKA_EVENT_CONSUMER_HANDLER_CONFIG');

@Injectable()
export class KafkaEventConsumerHandler implements OnModuleInit {
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

  public constructor(
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
    @Inject(KAFKA_EVENT_CONSUMER_HANDLER_CONFIG)
    private readonly config: KafkaEventConsumerHandlerConfig,
  ) {
    this.maxRetries = this.config.resilienceOptions?.maxRetries ?? this.maxRetries;
    this.halfOpenAfterMs = this.config.resilienceOptions?.halfOpenAfterMs ?? this.halfOpenAfterMs;
    this.circuitBreakerThreshold =
      this.config.resilienceOptions?.circuitBreakerThreshold ?? this.circuitBreakerThreshold;

    if (this.config.enableDlq && !this.config.dlqTopic) {
      this.logger.error(
        'DLQ is enabled but no dlqTopic is configured for KafkaEventConsumerHandler',
        {
          host: this.config.host,
          port: this.config.port,
        },
      );
    }
  }

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
      this.logger.alert(`kafka operation completed successfully in ${duration}ms`),
    );

    this.policy.onFailure(({ duration, reason, handled }) =>
      this.logger.error(`kafka operation failed after ${duration}ms`, {
        component: Components.MESSAGE_BROKER,
        reason,
        handled,
        service: this.config.service,
      }),
    );
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

  private logErrors(message: string, info: Record<string, any>) {
    if (!this.config.logErrors) {
      return;
    }
    this.logger.error(message, { ...info });
  }

  private buildDlqPayload(options: {
    error: Error;
    attempts: number;
    topic?: string;
    message?: Message;
  }) {
    const { attempts, error, message, topic } = options;

    const payload = {
      dlqMetadata: {
        originalTopic: topic ?? null,
        timestamp: new Date().toISOString(),
        attempts,
        service: this.config.service,
        host: this.config.host,
        port: this.config.port,
        error: {
          name: error.name,
          message: error.message,
          stack: (error.stack || '').slice(0, 10_000),
        },
      },
      originalMessage: message
        ? {
            key: message.key?.toString() ?? null,
            value: message.value?.toString() ?? null,
            headers: this.headersToObject(message.headers),
          }
        : null,
    };

    return Buffer.from(JSON.stringify(payload));
  }

  private headersToObject(headers?: IHeaders) {
    if (!headers) return null;

    const obj: Record<string, string> = {};

    for (const k of Object.keys(headers)) {
      const val = headers[k];
      obj[k] = val == null ? '' : Buffer.isBuffer(val) ? val.toString() : String(val);
    }
    return obj;
  }

  private incrementRetryHeader(headers?: IHeaders) {
    const out: IHeaders = { ...(headers ?? {}) };
    const curr = headers?.['x-retry-count'] ? Number(headers['x-retry-count']) : 0;

    out['x-retry-count'] = String(curr + 1);
    out['x-last-retry-timestamp'] = new Date().toISOString();

    return out;
  }

  private async publishToDlq(options: {
    error: Error;
    attempts: number;
    topic?: string;
    message?: Message;
  }) {
    const { attempts, error, message, topic } = options;

    if (!this.config.enableDlq || !this.config.dlqTopic) {
      this.logger.alert('DLQ is not enabled or dlqTopic not configured; skipping DLQ publish', {
        topic,
        service: this.config.service,
      });
      return;
    }

    const dlqMessage: Message = {
      key: message?.key,
      value: this.buildDlqPayload({ topic, message, error, attempts }),
      headers: this.incrementRetryHeader(message?.headers),
    };

    try {
      // publish message to DLQ (could be any store, like mongoDB)
      this.logger.alert(`Publish this message to a dead letter queue`, dlqMessage);
      await new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });

      this.logger.alert('Message published to DLQ', {
        dlqTopic: this.config.dlqTopic,
        originalTopic: topic,
        key: message?.key?.toString(),
        attempts,
      });
    } catch (pErr) {
      this.logger.error('Failed to publish to DLQ', {
        dlqTopic: this.config.dlqTopic,
        error: (pErr as Error).message,
        originalTopic: topic,
        key: message?.key?.toString(),
      });

      throw new EventBusUnknownException({
        message: 'Failed to publish to DLQ',
        contextError: pErr as Error,
        meta: { dlqTopic: this.config.dlqTopic, originalTopic: topic },
      });
    }
  }

  private shouldSendToDlqOnFinalFailure(error: any): boolean {
    if (!this.config.enableDlq) return false;

    if (error instanceof DomainException) return !!this.config.dlqOnDomainException;
    if (error instanceof ApplicationException) return !!this.config.dlqOnApplicationException;

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
  }

  public async execute<TExecutionResult>(
    operation: () => TExecutionResult | Promise<TExecutionResult>,
    options: KafkaConsumerOperationOptions,
  ): Promise<TExecutionResult> {
    const { topic, message } = options;

    let attempts = 0;

    try {
      return await this.policy.execute(async () => {
        attempts++;
        return await operation();
      });
    } catch (OpError) {
      const error = OpError as Error;
      switch (true) {
        case error instanceof DomainException: {
          this.logErrors(`A domain exception occured while processing messages`, error);
          if (this.shouldSendToDlqOnFinalFailure(error)) {
            await this.publishToDlq({
              topic,
              message: {
                key: message?.eventId,
                value: JSON.stringify(message?.payload),
                timestamp: message?.occurredAt,
              },
              error,
              attempts,
            });
          }
          throw error;
        }

        case error instanceof ApplicationException: {
          this.logErrors(`An application exception occured while processing messages`, error);
          if (this.shouldSendToDlqOnFinalFailure(error)) {
            await this.publishToDlq({
              topic,
              message: {
                key: message?.eventId,
                value: JSON.stringify(message?.payload),
                timestamp: message?.occurredAt,
              },
              error,
              attempts,
            });
          }
          throw error;
        }

        case error instanceof KafkaJSConnectionError: {
          this.logErrors(`Unable to connect to message broker`, error);

          if (this.shouldSendToDlqOnFinalFailure(error)) {
            await this.publishToDlq({
              topic,
              message: {
                key: message?.eventId,
                value: JSON.stringify(message?.payload),
                timestamp: message?.occurredAt,
              },
              error,
              attempts,
            });
          }

          throw new EventBusConnectionException({
            message: `Unable to connect to kafka broker`,
            contextError: error as Error,
            meta: {
              host: this.config.host,
              port: this.config.port,
            },
          });
        }

        case error instanceof KafkaJSRequestTimeoutError: {
          this.logErrors(`Message broker request timed out`, error);

          if (this.shouldSendToDlqOnFinalFailure(error)) {
            await this.publishToDlq({
              topic,
              message: {
                key: message?.eventId,
                value: JSON.stringify(message?.payload),
                timestamp: message?.occurredAt,
              },
              error,
              attempts,
            });
          }

          throw new EventBusTimeoutException({
            message: `Request timed out for kafka broker`,
            contextError: error,
            meta: {
              host: this.config.host,
              port: this.config.port,
              topic,
              message: JSON.stringify(message),
            },
          });
        }

        case this.isNetworkError(error): {
          this.logErrors('Network error while talking to kafka', {});

          if (this.shouldSendToDlqOnFinalFailure(error)) {
            await this.publishToDlq({
              topic,
              message: {
                key: message?.eventId,
                value: JSON.stringify(message?.payload),
                timestamp: message?.occurredAt,
              },
              error,
              attempts,
            });
          }

          throw new EventBusConnectionException({
            message: `Network error while talking to kafka`,
            contextError: error,
            meta: { host: this.config.host, port: this.config.port },
          });
        }

        default: {
          if (this.shouldSendToDlqOnFinalFailure(error)) {
            await this.publishToDlq({
              topic,
              message: {
                key: message?.eventId,
                value: JSON.stringify(message?.payload),
                timestamp: message?.occurredAt,
              },
              error,
              attempts,
            });
          }

          this.logErrors(`Unknown message broker error occured`, error);

          throw new EventBusUnknownException({
            message: `An unknown error occured while executing kafka operation`,
            contextError: error,
            meta: {
              host: this.config.host,
              port: this.config.port,
              topic,
              message: JSON.stringify(message),
            },
          });
        }
      }
    }
  }
}
