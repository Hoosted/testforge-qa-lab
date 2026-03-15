import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import type { JwtSignOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import type { AppEnvironment } from '../../config/app.environment';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
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
  providers: [AuthService, JwtStrategy, JwtAuthGuard],
  exports: [AuthService, PassportModule, JwtModule, JwtAuthGuard],
})
export class AuthModule {}
