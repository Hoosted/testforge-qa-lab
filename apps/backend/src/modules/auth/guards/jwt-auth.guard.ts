import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser>(error: unknown, user: TUser | false) {
    if (error || !user) {
      throw new UnauthorizedException('Authentication is required');
    }

    return user;
  }
}
