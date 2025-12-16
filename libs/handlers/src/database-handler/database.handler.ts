import { Inject, Injectable } from '@nestjs/common';
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
import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';

import { Components } from '@app/common/components';
import { LoggerPort, LOGGER_PORT } from '@app/ports/logger';
import {
  DatabaseConnectionException,
  DatabaseEntryAlreadyExistsException,
  DatabaseInvalidQueryException,
  DatabaseUnknownException,
} from '@app/exceptions/database-exceptions';

import { DatabaseFilterOptions } from './types';

@Injectable()
export class PrismaDatabaseHandler {
  private retryPolicy: RetryPolicy;
  private circuitBreakerPolicy: CircuitBreakerPolicy;
  private operationPolicy: IPolicy;

  constructor(@Inject(LOGGER_PORT) private readonly logger: LoggerPort) {}

  public retryPolicyConfig(maxRetryAttempts: number) {
    this.retryPolicy = retry(handleAll, {
      maxAttempts: maxRetryAttempts,
      backoff: new ExponentialBackoff(),
    });

    this.retryPolicy.onRetry(() => {
      this.logger.alert('Database operation has failed, retrying...', {
        component: Components.DATABASE,
      });
    });

    this.retryPolicy.onSuccess(() =>
      this.logger.info('Database operation completed successfully...', {
        component: Components.DATABASE,
      }),
    );
  }

  public circuitBreakerConfig(requestBreakerCount: number, allowHalfRequests: number) {
    this.circuitBreakerPolicy = circuitBreaker(handleAll, {
      halfOpenAfter: allowHalfRequests * 1000,
      breaker: new ConsecutiveBreaker(requestBreakerCount),
    });

    this.circuitBreakerPolicy.onBreak(() =>
      this.logger.alert('Too many request failed, Circuit is now Opened/broken', {
        circuitState: CircuitState.Open,
      }),
    );

    this.circuitBreakerPolicy.onHalfOpen(() =>
      this.logger.alert('Allowing only half of the requests to be executed now!', {
        component: Components.DATABASE,
        circuitState: CircuitState.HalfOpen,
      }),
    );

    this.circuitBreakerPolicy.onReset(() =>
      this.logger.info('Circuit breaker is now reset!', {
        component: Components.DATABASE,
      }),
    );
  }

  onModuleInit() {
    this.retryPolicyConfig(3);
    this.circuitBreakerConfig(10, 15);
    this.operationPolicy = wrap(this.retryPolicy, this.circuitBreakerPolicy);
  }

  async execute<TResult, TFallback = never>(
    databaseOperation: () => Promise<TResult>,
    options: DatabaseFilterOptions<TFallback>,
  ): Promise<TResult | NonNullable<TFallback>> {
    const {
      operationType,
      host,
      logErrors = true,
      suppressErrors = false,
      fallbackValue,
      entry,
      filter,
    } = options || {};
    try {
      return await this.operationPolicy.execute(async () => await databaseOperation());
    } catch (error) {
      this.logger.error(`error`, error as Error);
      if (suppressErrors && fallbackValue) {
        return fallbackValue;
      }

      if (error instanceof PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2002': {
            if (logErrors) {
              this.logger.error(`Entry already exist`, {
                component: Components.DATABASE,
                service: 'CHANNEL',
                error,
              });
            }

            throw new DatabaseEntryAlreadyExistsException({
              message: `User has already liked this video`,
              contextError: error,
              meta: {
                host,
                entityToCreate: entry,
              },
            });
          }

          case 'P2000':
          case 'P2001':
          case 'P2009': {
            if (logErrors) {
              this.logger.error(`Invalid query was recieved`, {
                component: Components.DATABASE,
                service: 'CHANNEL',
                error,
              });
            }

            throw new DatabaseInvalidQueryException({
              message: `Invalid query was recieved for a database operation`,
              contextError: error,
              meta: {
                host,
                query: error.meta,
                operationType,
                entry,
                filter,
              },
            });
          }

          default: {
            if (logErrors) {
              this.logger.error(`An Unknown error has occured`, {
                component: Components.DATABASE,
                service: 'CHANNEL',
                error,
              });
            }

            throw new DatabaseUnknownException({
              message: `Internal server error due to database error`,
              meta: { host },
              contextError: error,
            });
          }
        }
      } else if (error instanceof PrismaClientUnknownRequestError) {
        if (logErrors) {
          this.logger.error(`An Unknown error has occured`, {
            component: Components.DATABASE,
            service: 'CHANNEL',
            error,
          });
        }

        throw new DatabaseUnknownException({
          message: `Internal server error due to database error`,
          meta: { host },
          contextError: error,
        });
      } else if (error instanceof PrismaClientInitializationError) {
        if (logErrors) {
          this.logger.error(`Unable to connect to database: ${host}`, {
            component: Components.DATABASE,
            service: 'CHANNEL',
            error,
          });
        }

        throw new DatabaseConnectionException({
          message: `Unable to connect to database`,
          meta: { host },
          contextError: error,
        });
      } else if (error instanceof PrismaClientValidationError) {
        if (logErrors) {
          this.logger.error(`Invalid query was recieved`, {
            component: Components.DATABASE,
            service: 'CHANNEL',
            error,
          });
        }

        throw new DatabaseInvalidQueryException({
          message: `Invalid query was recieved for a database operation`,
          contextError: error,
          meta: {
            host,
          },
        });
      }
      if (logErrors) {
        this.logger.error(`An Unknown error has occured`, {
          component: Components.DATABASE,
          service: 'CHANNEL',
          error: error as Error,
        });
      }

      throw new DatabaseUnknownException({
        message: `Internal server error due to database error`,
        meta: { host },
        contextError: error as Error,
      });
    }
  }
}
