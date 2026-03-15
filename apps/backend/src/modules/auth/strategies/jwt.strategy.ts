import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { UserRole } from '@testforge/shared-types';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { AppEnvironment } from '../../../config/app.environment';

interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(ConfigService) configService: ConfigService) {
    const appConfig = configService.getOrThrow<AppEnvironment>('app');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: appConfig.jwt.accessSecret,
      issuer: appConfig.jwt.issuer,
      audience: appConfig.jwt.audience,
    });
  }

  validate(payload: JwtPayload) {
    return payload;
  }
}
