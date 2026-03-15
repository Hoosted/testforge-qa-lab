import { createParamDecorator } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import type { AuthJwtPayload } from '../auth.service';

interface HttpRequestLike {
  user?: AuthJwtPayload;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthJwtPayload | undefined => {
    const request = context.switchToHttp().getRequest<HttpRequestLike>();
    return request.user;
  },
);
