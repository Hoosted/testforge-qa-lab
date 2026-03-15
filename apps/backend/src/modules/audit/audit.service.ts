import { ForbiddenException, Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthJwtPayload } from '../auth/auth.service';
import type { ListAuditLogsQueryDto } from './dto/list-audit-logs-query.dto';
import type { AuditAction, AuditEntityType } from './audit.types';

@Injectable()
export class AuditService {
  constructor(private readonly prismaService: PrismaService) {}

  async record(payload: {
    entityType: AuditEntityType;
    entityId: string;
    action: AuditAction;
    summary: string;
    actor?: { id: string; name?: string | null } | null;
    before?: Prisma.InputJsonValue | null;
    after?: Prisma.InputJsonValue | null;
  }) {
    const data = {
      entityType: payload.entityType,
      entityId: payload.entityId,
      action: payload.action,
      summary: payload.summary,
      actorId: payload.actor?.id ?? null,
      actorName: payload.actor?.name ?? null,
      ...(payload.before !== undefined && payload.before !== null
        ? { before: payload.before }
        : {}),
      ...(payload.after !== undefined && payload.after !== null ? { after: payload.after } : {}),
    };

    await this.prismaService.auditLog.create({
      data,
    });
  }

  async listLogs(query: ListAuditLogsQueryDto, actor: AuthJwtPayload) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const skip = (page - 1) * pageSize;

    if (actor.role !== 'ADMIN' && query.entityType && query.entityType !== 'PRODUCT') {
      throw new ForbiddenException('Operators can only review product audit history');
    }

    const where: Prisma.AuditLogWhereInput = {
      ...(actor.role !== 'ADMIN' ? { entityType: 'PRODUCT' } : {}),
      ...(query.entityType ? { entityType: query.entityType } : {}),
      ...(query.entityId ? { entityId: query.entityId } : {}),
      ...(query.actorId ? { actorId: query.actorId } : {}),
      ...(query.action ? { action: query.action } : {}),
      ...(query.search
        ? {
            OR: [
              { summary: { contains: query.search, mode: 'insensitive' } },
              { actorName: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prismaService.auditLog.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          actor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      this.prismaService.auditLog.count({ where }),
    ]);

    return {
      items: items.map((item) => ({
        id: item.id,
        entityType: item.entityType,
        entityId: item.entityId,
        action: item.action,
        summary: item.summary,
        actor: item.actor
          ? {
              id: item.actor.id,
              name: item.actor.name,
              email: item.actor.email,
            }
          : item.actorName
            ? {
                id: null,
                name: item.actorName,
                email: null,
              }
            : null,
        before: item.before,
        after: item.after,
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
}
