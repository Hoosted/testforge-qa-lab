import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import type { AuthJwtPayload } from '../auth/auth.service';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateCategoryDto } from './dto/create-category.dto';
import type { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async listCategories() {
    const categories = await this.prismaService.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    return categories.map((category) => this.mapCategory(category));
  }

  async createCategory(payload: CreateCategoryDto, actor: AuthJwtPayload) {
    const normalizedName = payload.name.trim();
    const existing = await this.prismaService.category.findUnique({
      where: { name: normalizedName },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('Category name must be unique');
    }

    const category = await this.prismaService.category.create({
      data: {
        name: normalizedName,
        description: payload.description?.trim() || null,
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    await this.auditService.record({
      entityType: 'CATEGORY',
      entityId: category.id,
      action: 'CREATED',
      summary: `Category ${category.name} was created`,
      actor: await this.getActor(actor.sub),
      after: {
        name: category.name,
        description: category.description,
      },
    });

    return this.mapCategory(category);
  }

  async updateCategory(categoryId: string, payload: UpdateCategoryDto, actor: AuthJwtPayload) {
    const existing = await this.prismaService.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('Category not found');
    }

    if (payload.name && payload.name.trim() !== existing.name) {
      const duplicate = await this.prismaService.category.findUnique({
        where: { name: payload.name.trim() },
        select: { id: true },
      });

      if (duplicate) {
        throw new ConflictException('Category name must be unique');
      }
    }

    const updated = await this.prismaService.category.update({
      where: { id: categoryId },
      data: {
        ...(payload.name !== undefined ? { name: payload.name.trim() } : {}),
        ...(payload.description !== undefined
          ? { description: payload.description?.trim() || null }
          : {}),
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    await this.auditService.record({
      entityType: 'CATEGORY',
      entityId: updated.id,
      action: 'UPDATED',
      summary: `Category ${updated.name} was updated`,
      actor: await this.getActor(actor.sub),
      before: {
        name: existing.name,
        description: existing.description,
      },
      after: {
        name: updated.name,
        description: updated.description,
      },
    });

    return this.mapCategory(updated);
  }

  async deleteCategory(categoryId: string, actor: AuthJwtPayload) {
    const existing = await this.prismaService.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('Category not found');
    }

    if (existing._count.products > 0) {
      throw new ConflictException('Category cannot be deleted while products still use it');
    }

    await this.prismaService.category.delete({
      where: { id: categoryId },
    });

    await this.auditService.record({
      entityType: 'CATEGORY',
      entityId: existing.id,
      action: 'DELETED',
      summary: `Category ${existing.name} was deleted`,
      actor: await this.getActor(actor.sub),
      before: {
        name: existing.name,
        description: existing.description,
      },
    });

    return {
      message: 'Category deleted successfully',
    };
  }

  private mapCategory(category: {
    id: string;
    name: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
    _count: { products: number };
  }) {
    return {
      id: category.id,
      name: category.name,
      description: category.description ?? null,
      productCount: category._count.products,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
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
