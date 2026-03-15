import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import type { JwtSignOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import type { AppEnvironment } from '../../config/app.environment';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { JwtStrategy } from './strategies/jwt.strategy';

type JwtExpiration = NonNullable<JwtSignOptions['expiresIn']>;

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const appConfig = configService.getOrThrow<AppEnvironment>('app');

        return {
          secret: appConfig.jwt.accessSecret,
          signOptions: {
            expiresIn: appConfig.jwt.accessExpiresIn as JwtExpiration,
            issuer: appConfig.jwt.issuer,
            audience: appConfig.jwt.audience,
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, RolesGuard, Reflector],
  exports: [AuthService, PassportModule, JwtModule, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
