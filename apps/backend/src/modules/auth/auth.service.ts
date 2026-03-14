import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { JwtSignOptions } from '@nestjs/jwt';
import type { UserRole } from '@prisma/client';
import type { AppEnvironment } from '../../config/app.environment';

type JwtExpiration = NonNullable<JwtSignOptions['expiresIn']>;

export interface AuthJwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async issueAccessToken(payload: AuthJwtPayload) {
    return this.jwtService.signAsync(payload);
  }

  async issueRefreshToken(payload: AuthJwtPayload) {
    const appConfig = this.configService.getOrThrow<AppEnvironment>('app');

    return this.jwtService.signAsync(payload, {
      secret: appConfig.jwt.refreshSecret,
      expiresIn: appConfig.jwt.refreshExpiresIn as JwtExpiration,
      issuer: appConfig.jwt.issuer,
      audience: appConfig.jwt.audience,
    });
  }

  async verifyRefreshToken(token: string) {
    const appConfig = this.configService.getOrThrow<AppEnvironment>('app');

    return this.jwtService.verifyAsync<AuthJwtPayload>(token, {
      secret: appConfig.jwt.refreshSecret,
      issuer: appConfig.jwt.issuer,
      audience: appConfig.jwt.audience,
    });
  }
}
