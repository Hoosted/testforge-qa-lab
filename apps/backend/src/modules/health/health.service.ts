import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import type { AppEnvironment } from '../../config/app.environment';

@Injectable()
export class HealthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async getStatus() {
    const appConfig = this.configService.getOrThrow<AppEnvironment>('app');

    await this.prismaService.$queryRaw`SELECT 1`;

    return {
      status: 'ok' as const,
      service: 'testforge-api',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
      environment: appConfig.nodeEnv,
      database: {
        status: 'up' as const,
      },
    };
  }
}
