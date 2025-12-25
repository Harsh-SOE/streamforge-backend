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
import {
  PrismaClientInitializationError,
  PrismaClientUnknownRequestError,
} from '@prisma/client/runtime/library';
import { Inject, Injectable } from '@nestjs/common';

import {
  DatabaseUnknownException,
  DatabaseConnectionException,
  DatabaseInvalidQueryException,
  DatabaseEntityAlreadyExistsException,
  DatabaseEntityDoesNotExistsException,
} from '@app/exceptions/database-exceptions';
import { Components } from '@app/common/components';
import { LoggerPort, LOGGER_PORT } from '@app/ports/logger';

import { DatabaseOperationsOptions } from './types';
import {
  isPrismaInitializationError,
  isPrismaKnownRequestError,
  isPrismaUnknownRequestError,
  isPrismaValidationError,
} from './gaurds';

export interface DatabaseResillienceConfig {
  maxRetries?: number;
  circuitBreakerThreshold?: number;
  halfOpenAfterMs?: number;
}

export interface DatabaseConfig {
  host: string;
  service: string;
  logErrors?: boolean;
  resilienceOptions?: DatabaseResillienceConfig;
}

export const DATABASE_CONFIG = Symbol('DATABSE_CONFIG');

@Injectable()
export class PrismaDatabaseHandler {
  private readonly DEFAULT_MAX_RETRIES = 3;
  private readonly DEFAULT_CIRCUIT_BREAKER_THRESHOLD = 10;
  private readonly DEFAULT_HALF_OPEN_AFTER_MS = 10_000;

  private retryPolicy: RetryPolicy;
  private circuitBreakerPolicy: CircuitBreakerPolicy;
  private policy: IPolicy;

  constructor(
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
    @Inject(DATABASE_CONFIG) private readonly config: DatabaseConfig,
  ) {
    this.retryPolicyConfig();
    this.circuitBreakerPolicyConfig();
    this.policy = wrap(this.retryPolicy, this.circuitBreakerPolicy);
  }

  private retryPolicyConfig() {
    this.retryPolicy = retry(
      handleWhen(
        (error) =>
          error instanceof PrismaClientInitializationError ||
          error instanceof PrismaClientUnknownRequestError,
      ),
      {
        maxAttempts: this.config.resilienceOptions?.maxRetries ?? this.DEFAULT_MAX_RETRIES,
        backoff: new ExponentialBackoff(),
      },
    );

    this.retryPolicy.onRetry(({ attempt, delay }) => {
      this.logger.alert(
        `Database operation has failed. Attempt number: ${attempt}. ${attempt ? `Retrying in ${delay}ms` : `All Attempts exhausted, Operation has failed!`}`,
        {
          component: Components.DATABASE,
        },
      );
    });

    this.retryPolicy.onSuccess(({ duration }) =>
      this.logger.info(`Database operation completed successfully in ${duration}ms`, {
        component: Components.DATABASE,
      }),
    );
  }

  private circuitBreakerPolicyConfig() {
    this.circuitBreakerPolicy = circuitBreaker(
      handleWhen(
        (error) =>
          error instanceof PrismaClientInitializationError ||
          error instanceof PrismaClientUnknownRequestError,
      ),
      {
        halfOpenAfter:
          this.config.resilienceOptions?.halfOpenAfterMs ?? this.DEFAULT_HALF_OPEN_AFTER_MS,
        breaker: new ConsecutiveBreaker(
          this.config.resilienceOptions?.circuitBreakerThreshold ??
            this.DEFAULT_CIRCUIT_BREAKER_THRESHOLD,
        ),
      },
    );

    this.circuitBreakerPolicy.onBreak(() =>
      this.logger.alert('Too many requests failed, circuit is now broken', {
        circuitState: CircuitState.Open,
      }),
    );

    this.circuitBreakerPolicy.onHalfOpen(() =>
      this.logger.alert('Cicuit will now allow only half of the requests to pass through.', {
        component: Components.DATABASE,
        circuitState: CircuitState.HalfOpen,
      }),
    );

    this.circuitBreakerPolicy.onReset(() =>
      this.logger.info('Circuit is now reset', {
        component: Components.DATABASE,
      }),
    );
  }

  public async execute<TExecutionResult, TSupressedResult = never>(
    operation: () => TExecutionResult | Promise<TExecutionResult>,
    options: DatabaseOperationsOptions<TSupressedResult>,
  ): Promise<TExecutionResult | TSupressedResult> {
    const { operationType, suppressErrors, fallbackValue, entity, filter } = options || {};

    try {
      return await this.policy.execute(async () => await operation());
    } catch (error) {
      if (suppressErrors) {
        return fallbackValue;
      }

      if (isPrismaKnownRequestError(error)) {
        switch (error.code) {
          case 'P2002': {
            if (this.config.logErrors) {
              this.logger.error(`Entry already exist`, {
                component: Components.DATABASE,
                service: this.config.service,
                error,
              });
            }

            throw new DatabaseEntityAlreadyExistsException({
              message: `Entry already exists in database`,
              contextError: error,
              meta: {
                host: this.config.host,
                entityToCreate: entity,
              },
            });
          }

          case 'P2025': {
            if (this.config.logErrors) {
              this.logger.info(`Database entity not found`, {
                component: Components.DATABASE,
                meta: {
                  operationType,
                  filter,
                },
              });
            }

            throw new DatabaseEntityDoesNotExistsException({
              message: `Requested entity was not found in database`,
              contextError: error,
              meta: {
                host: this.config.host,
              },
            });
          }

          case 'P2000':
          case 'P2001':
          case 'P2009': {
            if (this.config.logErrors) {
              this.logger.error(`Invalid query was recieved`, {
                component: Components.DATABASE,
                error,
              });
            }

            throw new DatabaseInvalidQueryException({
              message: `Invalid query was recieved for a database operation`,
              contextError: error,
              meta: {
                host: this.config.host,
                query: error.meta,
                operationType,
                entity,
                filter,
              },
            });
          }

          default: {
            if (this.config.logErrors) {
              this.logger.error(`An Unknown error has occured`, {
                component: Components.DATABASE,
                error,
              });
            }

            throw new DatabaseUnknownException({
              message: `Internal server error due to database error`,
              meta: { host: this.config.host },
              contextError: error,
            });
          }
        }
      } else if (isPrismaUnknownRequestError(error)) {
        if (this.config.logErrors) {
          this.logger.error(`An Unknown error has occured`, {
            component: Components.DATABASE,
            error,
          });
        }

        throw new DatabaseUnknownException({
          message: `Internal server error due to database error`,
          meta: { host: this.config.host },
          contextError: error,
        });
      } else if (isPrismaInitializationError(error)) {
        if (this.config.logErrors) {
          this.logger.error(`Unable to connect to database: ${this.config.host}`, {
            component: Components.DATABASE,
            error,
          });
        }

        throw new DatabaseConnectionException({
          message: `Unable to connect to database`,
          meta: { host: this.config.host },
          contextError: error,
        });
      } else if (isPrismaValidationError(error)) {
        if (this.config.logErrors) {
          this.logger.error(`Invalid query was recieved`, {
            component: Components.DATABASE,
            error,
          });
        }

        throw new DatabaseInvalidQueryException({
          message: `Invalid query was recieved for a database operation`,
          contextError: error,
          meta: {
            host: this.config.host,
          },
        });
      }
      if (this.config.logErrors) {
        this.logger.error(`An Unknown error has occured`, {
          component: Components.DATABASE,
          error: error as Error,
        });
      }

      throw new DatabaseUnknownException({
        message: `Internal server error due to database error`,
        meta: { host: this.config.host },
        contextError: error as Error,
      });
    }
  }
}
