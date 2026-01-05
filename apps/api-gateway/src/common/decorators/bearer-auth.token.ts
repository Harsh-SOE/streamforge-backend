import { Request } from 'express';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const BearerAuth = createParamDecorator(
  (data: unknown, context: ExecutionContext): unknown => {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const authHeader = request.headers['authorization'];
    return authHeader?.split(' ')[1];
  },
);
