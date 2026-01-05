// TODO Check for transient network error
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
import { Inject, Injectable } from '@nestjs/common';

import { Components } from '@app/common';
import {
  DatabaseUnknownException,
  DatabaseConnectionException,
  DatabaseInvalidQueryException,
  DatabaseEntityAlreadyExistsException,
  DatabaseEntityDoesNotExistsException,
} from '@app/common/exceptions/payload/database-exceptions';
import { LoggerPort, LOGGER_PORT } from '@app/common/ports/logger';

import {
  isPrismaInitializationError,
  isPrismaKnownRequestError,
  isPrismaUnknownRequestError,
  isPrismaValidationError,
} from './gaurds';
import { Options } from './types';

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

export const DATABASE_HANDLER_CONFIG = Symbol('DATABASE_HANDLER_CONFIG');

@Injectable()
export class PrismaHandler {
  private readonly defaultMaxRetries = 3;
  private readonly defaultHalfOpenAfterMs = 10_000;
  private readonly defaultCircuitBreakerThreshold = 10;
  private readonly errorsToHandle = handleWhen(
    (error) => isPrismaInitializationError(error) || isPrismaUnknownRequestError(error),
  );

  private retryPolicy: RetryPolicy;
  private circuitPolicy: CircuitBreakerPolicy;
  private policy: IPolicy;

  constructor(
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
    @Inject(DATABASE_HANDLER_CONFIG) private readonly config: DatabaseConfig,
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

  private retryConfig() {
    this.retryPolicy = retry(this.errorsToHandle, {
      maxAttempts: this.config.resilienceOptions?.maxRetries ?? this.defaultMaxRetries,
      backoff: new ExponentialBackoff(),
    });

    this.retryPolicy.onRetry(({ attempt, delay }) => {
      this.logger.alert(
        `Database operation has failed. Attempt number: ${attempt}. ${attempt ? `Retrying in ${delay}ms` : `All Attempts exhausted, Operation has failed!`}`,
        {
          component: Components.DATABASE,
          service: this.config.service,
        },
      );
    });

    this.retryPolicy.onSuccess(({ duration }) =>
      this.logger.alert(`Database operation completed successfully in ${duration}ms`),
    );
  }

  private circuitConfig() {
    this.circuitPolicy = circuitBreaker(this.errorsToHandle, {
      halfOpenAfter: this.config.resilienceOptions?.halfOpenAfterMs ?? this.defaultHalfOpenAfterMs,
      breaker: new ConsecutiveBreaker(
        this.config.resilienceOptions?.circuitBreakerThreshold ??
          this.defaultCircuitBreakerThreshold,
      ),
    });

    this.circuitPolicy.onBreak(() =>
      this.logger.alert('Too many requests failed, circuit is now broken', {
        circuitState: CircuitState.Open,
        component: Components.DATABASE,
        service: this.config.service,
      }),
    );

    this.circuitPolicy.onHalfOpen(() =>
      this.logger.alert('Cicuit will now allow only half of the requests to pass through.', {
        circuitState: CircuitState.HalfOpen,
        component: Components.DATABASE,
        service: this.config.service,
      }),
    );

    this.circuitPolicy.onReset(() =>
      this.logger.info('Circuit is now reset', {
        CircuitState: CircuitState.Open,
        component: Components.DATABASE,
        service: this.config.service,
      }),
    );
  }

  public async execute<TExecutionResult>(
    operation: () => TExecutionResult | Promise<TExecutionResult>,
    options: Options,
  ): Promise<TExecutionResult> {
    const { operationType, entity, filter } = options;

    try {
      return await this.policy.execute(async () => await operation());
    } catch (error) {
      if (isPrismaKnownRequestError(error)) {
        switch (error.code) {
          case 'P2002': {
            this.logErrors(`Entry already exist`, {
              operationType,
              entity,
              component: Components.DATABASE,
              service: this.config.service,
              errorType: error.name ?? error.constructor.name,
            });

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
            this.logErrors(`Database entity not found`, {
              component: Components.DATABASE,
              meta: {
                operationType,
                entity,
                component: Components.DATABASE,
                service: this.config.service,
                errorType: error.name ?? error.constructor.name,
              },
            });

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
            this.logErrors(`Invalid query was recieved`, {
              operationType,
              entity,
              component: Components.DATABASE,
              service: this.config.service,
              errorType: error.name ?? error.constructor.name,
            });

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
            this.logErrors(`An Unknown error has occured`, {
              operationType,
              entity,
              component: Components.DATABASE,
              service: this.config.service,
              errorType: error.name ?? error.constructor.name,
            });

            throw new DatabaseUnknownException({
              message: `Internal server error due to database error`,
              meta: { host: this.config.host },
              contextError: error,
            });
          }
        }
      } else if (isPrismaUnknownRequestError(error)) {
        this.logErrors(`An Unknown error has occured`, {
          operationType,
          entity,
          component: Components.DATABASE,
          service: this.config.service,
          errorType: error.name ?? error.constructor.name,
        });

        throw new DatabaseUnknownException({
          message: `Internal server error due to database error`,
          meta: { host: this.config.host },
          contextError: error,
        });
      } else if (isPrismaInitializationError(error)) {
        this.logErrors(`Unable to connect to database: ${this.config.host}`, {
          operationType,
          entity,
          component: Components.DATABASE,
          service: this.config.service,
          errorType: error.name ?? error.constructor.name,
        });

        throw new DatabaseConnectionException({
          message: `Unable to connect to database`,
          meta: { host: this.config.host },
          contextError: error,
        });
      } else if (isPrismaValidationError(error)) {
        this.logErrors(`Invalid query was recieved`, {
          operationType,
          entity,
          component: Components.DATABASE,
          service: this.config.service,
          errorType: error.name ?? error.constructor.name,
        });

        throw new DatabaseInvalidQueryException({
          message: `Invalid query was recieved for a database operation`,
          contextError: error,
          meta: {
            host: this.config.host,
          },
        });
      }
      this.logErrors(`An Unknown error has occured`, {
        operationType,
        entity,
        component: Components.DATABASE,
        service: this.config.service,
        errorType: (error as Error).name ?? (error as Error).constructor.name,
      });

      throw new DatabaseUnknownException({
        message: `Internal server error due to database error`,
        meta: { host: this.config.host },
        contextError: error as Error,
      });
    }
  }
}
