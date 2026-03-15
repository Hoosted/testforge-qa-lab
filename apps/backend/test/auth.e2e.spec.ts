import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ValidationPipe, VersioningType, type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import bcrypt from 'bcrypt';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter';
import { PrismaService } from '../src/modules/prisma/prisma.service';

function createPrismaMock() {
  const now = new Date('2026-03-14T21:00:00.000Z');
  const passwordHash = bcrypt.hashSync('TestForge@123', 10);
  const users = [
    {
      id: 'admin-1',
      name: 'Admin User',
      email: 'admin@testforge.local',
      passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      lastLoginAt: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'operator-1',
      name: 'Operator User',
      email: 'operator@testforge.local',
      passwordHash,
      role: 'OPERATOR',
      status: 'ACTIVE',
      lastLoginAt: null,
      createdAt: now,
      updatedAt: now,
    },
  ];
  const sessions: Array<{
    id: string;
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    revokedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }> = [];

  return {
    user: {
      findUnique: async ({ where }: { where: { id?: string; email?: string } }) =>
        users.find((user) => (where.id ? user.id === where.id : user.email === where.email)) ??
        null,
      update: async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
        const user = users.find((item) => item.id === where.id);
        if (!user) {
          throw new Error('User not found');
        }
        Object.assign(user, data, { updatedAt: new Date() });
        return user;
      },
      findMany: async () => users,
      count: async () => users.length,
    },
    refreshSession: {
      create: async ({
        data,
      }: {
        data: { userId: string; tokenHash: string; expiresAt: Date };
      }) => {
        const session = {
          id: `session-${sessions.length + 1}`,
          userId: data.userId,
          tokenHash: data.tokenHash,
          expiresAt: data.expiresAt,
          revokedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        sessions.push(session);
        return session;
      },
      findMany: async ({
        where,
      }: {
        where: { userId: string; revokedAt: null; expiresAt?: { gt: Date } };
      }) =>
        sessions.filter(
          (session) =>
            session.userId === where.userId &&
            session.revokedAt === null &&
            (!where.expiresAt || session.expiresAt > where.expiresAt.gt),
        ),
      update: async ({ where, data }: { where: { id: string }; data: { revokedAt: Date } }) => {
        const session = sessions.find((item) => item.id === where.id);
        if (!session) {
          throw new Error('Session not found');
        }
        session.revokedAt = data.revokedAt;
        session.updatedAt = new Date();
        return session;
      },
    },
    category: {
      findUnique: async () => ({ id: 'category-1' }),
      findMany: async () => [],
    },
    supplier: {
      findUnique: async () => ({ id: 'supplier-1' }),
      findMany: async () => [],
    },
    tag: {
      count: async () => 0,
      findMany: async () => [],
    },
    product: {
      findMany: async () => [],
      count: async () => 0,
      findUnique: async () => null,
      findFirst: async () => null,
      create: async () => null,
      update: async () => null,
      delete: async () => null,
    },
    $queryRaw: async () => [1],
    $connect: async () => undefined,
    enableShutdownHooks: () => undefined,
  };
}

describe('Auth flow (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(createPrismaMock())
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
    });
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.useGlobalFilters(new GlobalExceptionFilter());
    await app.init();
  });

  afterEach(async () => {
    await app?.close();
  });

  it('logs in, refreshes and logs out successfully', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@testforge.local',
        password: 'TestForge@123',
      })
      .expect(200);

    expect(loginResponse.body.accessToken).toBeTypeOf('string');
    expect(loginResponse.body.user.role).toBe('ADMIN');
    expect(loginResponse.headers['set-cookie']).toBeDefined();

    const refreshCookie = loginResponse.headers['set-cookie'][0];

    const refreshResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .set('Cookie', refreshCookie)
      .expect(200);

    expect(refreshResponse.body.accessToken).toBeTypeOf('string');

    const logoutResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/logout')
      .set('Cookie', refreshResponse.headers['set-cookie'][0])
      .expect(200);

    expect(logoutResponse.body.message).toBe('Logged out successfully');
  });

  it('allows operator access and blocks operator from admin access', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'operator@testforge.local',
        password: 'TestForge@123',
      })
      .expect(200);

    const accessToken = loginResponse.body.accessToken;

    await request(app.getHttpServer())
      .get('/api/v1/auth/operator/access')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .get('/api/v1/auth/admin/access')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(403);
  });
});
