import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { KafkaJSConnectionError, KafkaJSRequestTimeoutError } from 'kafkajs';
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

import { Components } from '@app/common/components';
import { LOGGER_PORT, LoggerPort } from '@app/ports/logger';
import {
  MessageBrokerConnectionException,
  MessageBrokerTimeoutException,
  MessageBrokerUnknownException,
} from '@app/exceptions/message-broker-exceptions';

import { MessageBrokerFilterOptions } from './types';

@Injectable()
export class KafkaMessageBrokerHandler implements OnModuleInit {
  private retryPolicy: RetryPolicy;
  private circuitBreakerPolicy: CircuitBreakerPolicy;
  private operationPolicy: IPolicy;

  public constructor(
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
  ) {}

  public onModuleInit() {
    this.retryPolicyConfig(3);
    this.circuitBreakerConfig(10, 15);
    this.operationPolicy = wrap(this.retryPolicy, this.circuitBreakerPolicy);
  }

  public retryPolicyConfig(maxRetryAttempts: number) {
    this.retryPolicy = retry(handleAll, {
      maxAttempts: maxRetryAttempts,
      backoff: new ExponentialBackoff(),
    });

    this.retryPolicy.onRetry(() => {
      this.logger.alert('Message broker operation has failed, retrying...', {
        component: Components.MESSAGE_BROKER,
      });
    });

    this.retryPolicy.onSuccess(() =>
      this.logger.info('Message broker operation completed successfully...', {
        component: Components.MESSAGE_BROKER,
      }),
    );
  }

  public circuitBreakerConfig(
    requestBreakerCount: number,
    allowHalfRequests: number,
  ) {
    this.circuitBreakerPolicy = circuitBreaker(handleAll, {
      halfOpenAfter: allowHalfRequests * 1000,
      breaker: new ConsecutiveBreaker(requestBreakerCount),
    });

    this.circuitBreakerPolicy.onBreak(() =>
      this.logger.alert(
        'Too many request failed, Circuit is now Opened/broken',
        {
          circuitState: CircuitState.Open,
        },
      ),
    );

    this.circuitBreakerPolicy.onHalfOpen(() =>
      this.logger.alert(
        'Allowing only half of the requests to be executed now!',
        {
          component: Components.MESSAGE_BROKER,
          circuitState: CircuitState.HalfOpen,
        },
      ),
    );

    this.circuitBreakerPolicy.onReset(() =>
      this.logger.info('Circuit breaker is now reset!', {
        component: Components.MESSAGE_BROKER,
      }),
    );
  }

  public async filter<TMessageBrokerResponse, TFallback = never>(
    kafkaOperation: () => TMessageBrokerResponse,
    options: MessageBrokerFilterOptions<TFallback>,
  ) {
    const {
      logErrors,
      host,
      port,
      suppressErrors,
      fallbackValue,
      topic,
      message,
    } = options;
    try {
      return await this.operationPolicy.execute(() => kafkaOperation());
    } catch (error) {
      if (suppressErrors && fallbackValue) {
        return fallbackValue;
      }
      switch (true) {
        case error instanceof KafkaJSConnectionError: {
          if (logErrors) {
            this.logger.fatal(`Unable to connect to message broker`, error);
          }

          throw new MessageBrokerConnectionException({
            message: `Unable to connect to kafka broker: ${error.broker}`,
            contextError: error,
            meta: {
              host,
              port,
            },
          });
        }

        case error instanceof KafkaJSRequestTimeoutError:
          if (logErrors) {
            this.logger.fatal(`Message broker request timed out`, error);
          }
          throw new MessageBrokerTimeoutException({
            message: `Request timed out for kafka broker: ${error.broker}`,
            contextError: error,
            meta: {
              host,
              port,
              topic,
              message,
            },
          });

        default:
          if (logErrors) {
            this.logger.fatal(
              `Unknown message broker error occured`,
              error as Error,
            );
          }
          throw new MessageBrokerUnknownException({
            message: `An Unknown error occured while executing kafka operation`,
            contextError: error as Error,
            meta: {
              host,
              port,
              topic,
              message,
            },
          });
      }
    }
  }
}
