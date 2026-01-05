import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';

export function isPrismaKnownRequestError(error: any): error is PrismaClientKnownRequestError {
  const err = error as Error;
  return (
    err.name === 'PrismaClientKnownRequestError' ||
    err.constructor.name === 'PrismaClientKnownRequestError'
  );
}

export function isPrismaInitializationError(error: any): error is PrismaClientInitializationError {
  const err = error as Error;
  return (
    err.name === 'PrismaClientInitializationError' ||
    err.constructor.name === 'PrismaClientInitializationError'
  );
}

export function isPrismaUnknownRequestError(error: any): error is PrismaClientUnknownRequestError {
  const err = error as Error;
  return (
    err.name === 'PrismaClientUnknownRequestError' ||
    err.constructor.name === 'PrismaClientUnknownRequestError'
  );
}

export function isPrismaValidationError(error: any): error is PrismaClientValidationError {
  const err = error as Error;
  return (
    err.name === 'PrismaClientValidationError' ||
    err.constructor.name === 'PrismaClientValidationError'
  );
}
