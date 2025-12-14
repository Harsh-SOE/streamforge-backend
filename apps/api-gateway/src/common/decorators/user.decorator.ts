import { Request } from 'express';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { UserAuthPayload } from '@app/contracts/auth';

export const User = createParamDecorator(
  (data: keyof UserAuthPayload, context: ExecutionContext) => {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const extractedUser = request.user as UserAuthPayload;
    return data ? extractedUser[data] : extractedUser;
  },
);
