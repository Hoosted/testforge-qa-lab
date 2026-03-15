import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import type { AuthJwtPayload } from '../auth/auth.service';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateSupplierDto } from './dto/create-supplier.dto';
import type { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async listSuppliers() {
    const suppliers = await this.prismaService.supplier.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    return suppliers.map((supplier) => this.mapSupplier(supplier));
  }

  async createSupplier(payload: CreateSupplierDto, actor: AuthJwtPayload) {
    const normalizedName = payload.name.trim();
    const existing = await this.prismaService.supplier.findUnique({
      where: { name: normalizedName },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('Supplier name must be unique');
    }

    const supplier = await this.prismaService.supplier.create({
      data: {
        name: normalizedName,
        email: payload.email?.trim().toLowerCase() || null,
        phone: payload.phone?.trim() || null,
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
      entityType: 'SUPPLIER',
      entityId: supplier.id,
      action: 'CREATED',
      summary: `Supplier ${supplier.name} was created`,
      actor: await this.getActor(actor.sub),
      after: {
        name: supplier.name,
        email: supplier.email,
        phone: supplier.phone,
      },
    });

    return this.mapSupplier(supplier);
  }

  async updateSupplier(supplierId: string, payload: UpdateSupplierDto, actor: AuthJwtPayload) {
    const existing = await this.prismaService.supplier.findUnique({
      where: { id: supplierId },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('Supplier not found');
    }

    if (payload.name && payload.name.trim() !== existing.name) {
      const duplicate = await this.prismaService.supplier.findUnique({
        where: { name: payload.name.trim() },
        select: { id: true },
      });

      if (duplicate) {
        throw new ConflictException('Supplier name must be unique');
      }
    }

    const updated = await this.prismaService.supplier.update({
      where: { id: supplierId },
      data: {
        ...(payload.name !== undefined ? { name: payload.name.trim() } : {}),
        ...(payload.email !== undefined
          ? { email: payload.email?.trim().toLowerCase() || null }
          : {}),
        ...(payload.phone !== undefined ? { phone: payload.phone?.trim() || null } : {}),
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
      entityType: 'SUPPLIER',
      entityId: updated.id,
      action: 'UPDATED',
      summary: `Supplier ${updated.name} was updated`,
      actor: await this.getActor(actor.sub),
      before: {
        name: existing.name,
        email: existing.email,
        phone: existing.phone,
      },
      after: {
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
      },
    });

    return this.mapSupplier(updated);
  }

  async deleteSupplier(supplierId: string, actor: AuthJwtPayload) {
    const existing = await this.prismaService.supplier.findUnique({
      where: { id: supplierId },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('Supplier not found');
    }

    if (existing._count.products > 0) {
      throw new ConflictException('Supplier cannot be deleted while products still use it');
    }

    await this.prismaService.supplier.delete({
      where: { id: supplierId },
    });

    await this.auditService.record({
      entityType: 'SUPPLIER',
      entityId: existing.id,
      action: 'DELETED',
      summary: `Supplier ${existing.name} was deleted`,
      actor: await this.getActor(actor.sub),
      before: {
        name: existing.name,
        email: existing.email,
        phone: existing.phone,
      },
    });

    return {
      message: 'Supplier deleted successfully',
    };
  }

  private mapSupplier(supplier: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    createdAt: Date;
    updatedAt: Date;
    _count: { products: number };
  }) {
    return {
      id: supplier.id,
      name: supplier.name,
      email: supplier.email ?? null,
      phone: supplier.phone ?? null,
      productCount: supplier._count.products,
      createdAt: supplier.createdAt.toISOString(),
      updatedAt: supplier.updatedAt.toISOString(),
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
