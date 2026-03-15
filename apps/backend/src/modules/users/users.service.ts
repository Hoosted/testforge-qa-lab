import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import type { AuthJwtPayload } from '../auth/auth.service';
import { PrismaService } from '../prisma/prisma.service';
import type { ListUsersQueryDto } from './dto/list-users-query.dto';
import type { UpdateProfileDto } from './dto/update-profile.dto';
import type { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async listUsers(query: ListUsersQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const skip = (page - 1) * pageSize;
    const where: Prisma.UserWhereInput = {
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { email: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(query.role ? { role: query.role } : {}),
      ...(query.status ? { status: query.status } : {}),
    };

    const [items, total] = await Promise.all([
      this.prismaService.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          lastLoginAt: true,
          createdAt: true,
        },
      }),
      this.prismaService.user.count({ where }),
    ]);

    return {
      items: items.map((item) => ({
        ...item,
        lastLoginAt: item.lastLoginAt?.toISOString() ?? null,
        createdAt: item.createdAt.toISOString(),
      })),
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    };
  }

  async getProfile(userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      ...user,
      lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
      createdAt: user.createdAt.toISOString(),
    };
  }

  async updateProfile(userId: string, payload: UpdateProfileDto, actor: AuthJwtPayload) {
    const existingUser = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prismaService.user.update({
      where: { id: userId },
      data: {
        name: payload.name.trim(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    await this.auditService.record({
      entityType: 'USER',
      entityId: updatedUser.id,
      action: 'PROFILE_UPDATED',
      summary: `Profile for ${updatedUser.email} was updated`,
      actor: await this.getActor(actor.sub),
      before: {
        name: existingUser.name,
      },
      after: {
        name: updatedUser.name,
      },
    });

    return {
      ...updatedUser,
      lastLoginAt: updatedUser.lastLoginAt?.toISOString() ?? null,
      createdAt: updatedUser.createdAt.toISOString(),
    };
  }

  async updateUser(userId: string, payload: UpdateUserDto, actor: AuthJwtPayload) {
    const existingUser = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prismaService.user.update({
      where: { id: userId },
      data: {
        ...(payload.role ? { role: payload.role } : {}),
        ...(payload.status ? { status: payload.status } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    const action =
      payload.role && payload.role !== existingUser.role
        ? 'ROLE_CHANGED'
        : payload.status && payload.status !== existingUser.status
          ? 'STATUS_CHANGED'
          : 'UPDATED';

    await this.auditService.record({
      entityType: 'USER',
      entityId: updatedUser.id,
      action,
      summary: `User ${updatedUser.email} was updated`,
      actor: await this.getActor(actor.sub),
      before: {
        role: existingUser.role,
        status: existingUser.status,
      },
      after: {
        role: updatedUser.role,
        status: updatedUser.status,
      },
    });

    return {
      ...updatedUser,
      lastLoginAt: updatedUser.lastLoginAt?.toISOString() ?? null,
      createdAt: updatedUser.createdAt.toISOString(),
    };
  }

  private getActor(userId: string) {
    return this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
      },
    });
  }
}
