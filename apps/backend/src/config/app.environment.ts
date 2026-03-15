import { registerAs } from '@nestjs/config';

export interface AppEnvironment {
  nodeEnv: string;
  port: number;
  apiPrefix: string;
  frontendUrl: string;
  auth: {
    cookieName: string;
    cookieDomain?: string;
    secureCookies: boolean;
  };
  jwt: {
    accessSecret: string;
    refreshSecret: string;
    accessExpiresIn: string;
    refreshExpiresIn: string;
    issuer: string;
    audience: string;
  };
}

export const appEnvironment = registerAs(
  'app',
  (): AppEnvironment => ({
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT ?? 3001),
    apiPrefix: process.env.API_PREFIX ?? 'api/v1',
    frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    auth: {
      cookieName: process.env.AUTH_COOKIE_NAME ?? 'testforge_rt',
      ...(process.env.AUTH_COOKIE_DOMAIN ? { cookieDomain: process.env.AUTH_COOKIE_DOMAIN } : {}),
      secureCookies: process.env.AUTH_COOKIE_SECURE === 'true',
    },
    jwt: {
      accessSecret: process.env.JWT_ACCESS_SECRET ?? '',
      refreshSecret: process.env.JWT_REFRESH_SECRET ?? '',
      accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
      issuer: process.env.JWT_ISSUER ?? 'testforge-api',
      audience: process.env.JWT_AUDIENCE ?? 'testforge-web',
    },
  }),
);
