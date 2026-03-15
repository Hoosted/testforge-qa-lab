import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { JwtSignOptions } from '@nestjs/jwt';
import type { User } from '@prisma/client';
import bcrypt from 'bcrypt';
import type { AuthPermissionMap, AuthUser, UserRole } from '@testforge/shared-types';
import type { AppEnvironment } from '../../config/app.environment';
import { PrismaService } from '../prisma/prisma.service';

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
    private readonly prismaService: PrismaService,
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

  buildPermissions(role: UserRole): AuthPermissionMap {
    return {
      canAccessAdminArea: role === 'ADMIN',
      canAccessOperatorArea: role === 'ADMIN' || role === 'OPERATOR',
      canManageProducts: role === 'ADMIN',
      canManageCatalog: role === 'ADMIN',
      canManageUsers: role === 'ADMIN',
      canViewAuditLogs: true,
    };
  }

  buildAuthUser(user: Pick<User, 'id' | 'name' | 'email' | 'role'>): AuthUser {
    const role = user.role as UserRole;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role,
      permissions: this.buildPermissions(role),
    };
  }

  async validateUserCredentials(email: string, password: string) {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return user;
  }

  async createSession(user: Pick<User, 'id' | 'email' | 'role'>) {
    const payload: AuthJwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role as UserRole,
    };
    const accessToken = await this.issueAccessToken(payload);
    const refreshToken = await this.issueRefreshToken(payload);
    const tokenHash = await bcrypt.hash(refreshToken, 10);
    const refreshExpiresAt = this.getRefreshExpiryDate();

    await this.prismaService.refreshSession.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: refreshExpiresAt,
      },
    });

    await this.prismaService.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async rotateRefreshSession(refreshToken: string) {
    const payload = await this.verifyRefreshToken(refreshToken);
    const user = await this.prismaService.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Session is no longer valid');
    }

    const activeSessions = await this.prismaService.refreshSession.findMany({
      where: {
        userId: user.id,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const currentSession = await this.findMatchingRefreshSession(refreshToken, activeSessions);

    if (!currentSession) {
      throw new UnauthorizedException('Session is no longer valid');
    }

    const nextSession = await this.createSession(user);

    await this.prismaService.refreshSession.update({
      where: { id: currentSession.id },
      data: { revokedAt: new Date() },
    });

    return {
      user: this.buildAuthUser(user),
      ...nextSession,
    };
  }

  async revokeRefreshSession(refreshToken: string) {
    const payload = await this.verifyRefreshToken(refreshToken);
    const sessions = await this.prismaService.refreshSession.findMany({
      where: {
        userId: payload.sub,
        revokedAt: null,
      },
    });
    const currentSession = await this.findMatchingRefreshSession(refreshToken, sessions);

    if (!currentSession) {
      return;
    }

    await this.prismaService.refreshSession.update({
      where: { id: currentSession.id },
      data: { revokedAt: new Date() },
    });
  }

  async getAuthenticatedUser(userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Authenticated user is not available');
    }

    return this.buildAuthUser(user);
  }

  private async findMatchingRefreshSession(
    refreshToken: string,
    sessions: Array<{ id: string; tokenHash: string }>,
  ) {
    for (const session of sessions) {
      const isMatch = await bcrypt.compare(refreshToken, session.tokenHash);

      if (isMatch) {
        return session;
      }
    }

    return null;
  }

  private getRefreshExpiryDate() {
    const appConfig = this.configService.getOrThrow<AppEnvironment>('app');
    const refreshValue = appConfig.jwt.refreshExpiresIn;
    const match = /^(\d+)([smhd])$/.exec(refreshValue);

    if (!match) {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }

    const [, amount, unit] = match;
    const amountValue = Number(amount);
    const multiplierMap: Record<'s' | 'm' | 'h' | 'd', number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return new Date(Date.now() + amountValue * multiplierMap[unit as keyof typeof multiplierMap]);
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
