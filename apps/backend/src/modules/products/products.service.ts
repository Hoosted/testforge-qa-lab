import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Prisma as PrismaNamespace } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthJwtPayload } from '../auth/auth.service';
import type { CreateProductDto } from './dto/create-product.dto';
import type { ListProductsQueryDto } from './dto/list-products-query.dto';
import type { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prismaService: PrismaService) {}

  async listProducts(query: ListProductsQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const skip = (page - 1) * pageSize;
    const tagIds = query.tagIds?.split(',').filter(Boolean) ?? [];
    const where: PrismaNamespace.ProductWhereInput = {
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { sku: { contains: query.search, mode: 'insensitive' } },
              { barcode: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.isActive !== undefined ? { isActive: query.isActive === 'true' } : {}),
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.supplierId ? { supplierId: query.supplierId } : {}),
      ...(tagIds.length > 0
        ? {
            productTags: {
              some: {
                tagId: {
                  in: tagIds,
                },
              },
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prismaService.product.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: {
          [query.sortBy ?? 'createdAt']: query.sortOrder ?? 'desc',
        },
        include: this.productInclude(),
      }),
      this.prismaService.product.count({ where }),
    ]);

    return {
      items: items.map((item) => this.mapProduct(item)),
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    };
  }

  async getProduct(productId: string) {
    const product = await this.prismaService.product.findUnique({
      where: { id: productId },
      include: this.productInclude(),
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.mapProduct(product);
  }

  async createProduct(payload: CreateProductDto, actor: AuthJwtPayload) {
    await this.validateBusinessRules(payload);
    await this.ensureUniqueProductFields(payload.sku, payload.barcode);

    const product = await this.prismaService.product.create({
      data: {
        name: payload.name,
        sku: payload.sku,
        shortDescription: payload.shortDescription,
        longDescription: payload.longDescription,
        price: new Prisma.Decimal(payload.price),
        promotionalPrice: payload.promotionalPrice
          ? new Prisma.Decimal(payload.promotionalPrice)
          : null,
        cost: new Prisma.Decimal(payload.cost),
        stockQuantity: payload.stockQuantity,
        categoryId: payload.categoryId,
        supplierId: payload.supplierId,
        status: payload.status,
        isActive: payload.isActive,
        weight: new Prisma.Decimal(payload.weight),
        width: new Prisma.Decimal(payload.width),
        height: new Prisma.Decimal(payload.height),
        length: new Prisma.Decimal(payload.length),
        barcode: payload.barcode ?? null,
        expirationDate: payload.expirationDate ? new Date(payload.expirationDate) : null,
        createdById: actor.sub,
        lastUpdatedById: actor.sub,
        productTags: {
          create: (payload.tagIds ?? []).map((tagId) => ({ tagId })),
        },
      },
      include: this.productInclude(),
    });

    return this.mapProduct(product);
  }

  async updateProduct(productId: string, payload: UpdateProductDto, actor: AuthJwtPayload) {
    const existingProduct = await this.prismaService.product.findUnique({
      where: { id: productId },
      include: {
        productTags: true,
      },
    });

    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    const mergedPayload = {
      ...existingProduct,
      ...payload,
      tagIds: payload.tagIds ?? existingProduct.productTags.map((item) => item.tagId),
    };

    await this.validateBusinessRules(mergedPayload);
    await this.ensureUniqueProductFields(payload.sku, payload.barcode, productId);

    const product = await this.prismaService.product.update({
      where: { id: productId },
      data: {
        ...(payload.name !== undefined ? { name: payload.name } : {}),
        ...(payload.sku !== undefined ? { sku: payload.sku } : {}),
        ...(payload.shortDescription !== undefined
          ? { shortDescription: payload.shortDescription }
          : {}),
        ...(payload.longDescription !== undefined
          ? { longDescription: payload.longDescription }
          : {}),
        ...(payload.price !== undefined ? { price: new Prisma.Decimal(payload.price) } : {}),
        ...(payload.promotionalPrice !== undefined
          ? {
              promotionalPrice: payload.promotionalPrice
                ? new Prisma.Decimal(payload.promotionalPrice)
                : null,
            }
          : {}),
        ...(payload.cost !== undefined ? { cost: new Prisma.Decimal(payload.cost) } : {}),
        ...(payload.stockQuantity !== undefined ? { stockQuantity: payload.stockQuantity } : {}),
        ...(payload.categoryId !== undefined ? { categoryId: payload.categoryId } : {}),
        ...(payload.supplierId !== undefined ? { supplierId: payload.supplierId } : {}),
        ...(payload.status !== undefined ? { status: payload.status } : {}),
        ...(payload.isActive !== undefined ? { isActive: payload.isActive } : {}),
        ...(payload.weight !== undefined ? { weight: new Prisma.Decimal(payload.weight) } : {}),
        ...(payload.width !== undefined ? { width: new Prisma.Decimal(payload.width) } : {}),
        ...(payload.height !== undefined ? { height: new Prisma.Decimal(payload.height) } : {}),
        ...(payload.length !== undefined ? { length: new Prisma.Decimal(payload.length) } : {}),
        ...(payload.barcode !== undefined ? { barcode: payload.barcode || null } : {}),
        ...(payload.expirationDate !== undefined
          ? { expirationDate: payload.expirationDate ? new Date(payload.expirationDate) : null }
          : {}),
        lastUpdatedById: actor.sub,
        ...(payload.tagIds
          ? {
              productTags: {
                deleteMany: {},
                create: payload.tagIds.map((tagId) => ({ tagId })),
              },
            }
          : {}),
      },
      include: this.productInclude(),
    });

    return this.mapProduct(product);
  }

  async deleteProduct(productId: string) {
    const existingProduct = await this.prismaService.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    await this.prismaService.product.delete({
      where: { id: productId },
    });

    return {
      message: 'Product deleted successfully',
    };
  }

  async updateProductImage(productId: string, imageUrl: string, actor: AuthJwtPayload) {
    const existingProduct = await this.prismaService.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    const product = await this.prismaService.product.update({
      where: { id: productId },
      data: {
        imageUrl,
        lastUpdatedById: actor.sub,
      },
      include: this.productInclude(),
    });

    return this.mapProduct(product);
  }

  async getMetadata() {
    const [categories, suppliers, tags] = await Promise.all([
      this.prismaService.category.findMany({ orderBy: { name: 'asc' } }),
      this.prismaService.supplier.findMany({ orderBy: { name: 'asc' } }),
      this.prismaService.tag.findMany({ orderBy: { name: 'asc' } }),
    ]);

    return {
      categories,
      suppliers,
      tags,
      statuses: ['DRAFT', 'READY', 'ARCHIVED'],
    };
  }

  private async validateBusinessRules(payload: {
    price?: string | Prisma.Decimal;
    promotionalPrice?: string | Prisma.Decimal | null;
    stockQuantity?: number;
    categoryId?: string;
    supplierId?: string;
    tagIds?: string[];
  }) {
    if (payload.stockQuantity !== undefined && payload.stockQuantity < 0) {
      throw new BadRequestException('Stock quantity cannot be negative');
    }

    const priceValue = payload.price ? Number(payload.price) : null;
    const promotionalValue =
      payload.promotionalPrice !== undefined && payload.promotionalPrice !== null
        ? Number(payload.promotionalPrice)
        : null;

    if (
      priceValue !== null &&
      promotionalValue !== null &&
      Number.isFinite(priceValue) &&
      Number.isFinite(promotionalValue) &&
      promotionalValue >= priceValue
    ) {
      throw new BadRequestException('Promotional price must be lower than the regular price');
    }

    if (payload.categoryId) {
      const category = await this.prismaService.category.findUnique({
        where: { id: payload.categoryId },
        select: { id: true },
      });
      if (!category) {
        throw new BadRequestException('Category not found');
      }
    }

    if (payload.supplierId) {
      const supplier = await this.prismaService.supplier.findUnique({
        where: { id: payload.supplierId },
        select: { id: true },
      });
      if (!supplier) {
        throw new BadRequestException('Supplier not found');
      }
    }

    if (payload.tagIds && payload.tagIds.length > 0) {
      const foundTags = await this.prismaService.tag.count({
        where: {
          id: {
            in: payload.tagIds,
          },
        },
      });
      if (foundTags !== payload.tagIds.length) {
        throw new BadRequestException('One or more tags could not be found');
      }
    }
  }

  private async ensureUniqueProductFields(sku?: string, barcode?: string, productId?: string) {
    if (sku) {
      const existingSku = await this.prismaService.product.findFirst({
        where: {
          sku,
          ...(productId ? { NOT: { id: productId } } : {}),
        },
        select: { id: true },
      });

      if (existingSku) {
        throw new ConflictException('SKU must be unique');
      }
    }

    if (barcode) {
      const existingBarcode = await this.prismaService.product.findFirst({
        where: {
          barcode,
          ...(productId ? { NOT: { id: productId } } : {}),
        },
        select: { id: true },
      });

      if (existingBarcode) {
        throw new ConflictException('Barcode must be unique');
      }
    }
  }

  private productInclude() {
    return {
      category: true,
      supplier: true,
      createdBy: {
        select: {
          id: true,
          name: true,
        },
      },
      lastUpdatedBy: {
        select: {
          id: true,
          name: true,
        },
      },
      productTags: {
        include: {
          tag: true,
        },
      },
    } satisfies PrismaNamespace.ProductInclude;
  }

  private mapProduct(
    product: PrismaNamespace.ProductGetPayload<{
      include: {
        category: true;
        supplier: true;
        createdBy: {
          select: {
            id: true;
            name: true;
          };
        };
        lastUpdatedBy: {
          select: {
            id: true;
            name: true;
          };
        };
        productTags: {
          include: {
            tag: true;
          };
        };
      };
    }>,
  ) {
    return {
      id: product.id,
      name: product.name,
      sku: product.sku,
      shortDescription: product.shortDescription,
      longDescription: product.longDescription,
      price: product.price.toString(),
      promotionalPrice: product.promotionalPrice?.toString() ?? null,
      cost: product.cost.toString(),
      stockQuantity: product.stockQuantity,
      category: {
        id: product.category.id,
        name: product.category.name,
      },
      supplier: {
        id: product.supplier.id,
        name: product.supplier.name,
      },
      status: product.status,
      isActive: product.isActive,
      weight: product.weight.toString(),
      width: product.width.toString(),
      height: product.height.toString(),
      length: product.length.toString(),
      tags: product.productTags.map((item) => ({
        id: item.tag.id,
        name: item.tag.name,
        color: item.tag.color ?? null,
      })),
      barcode: product.barcode ?? null,
      expirationDate: product.expirationDate?.toISOString() ?? null,
      imageUrl: product.imageUrl ?? null,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
      createdBy: product.createdBy,
      lastUpdatedBy: product.lastUpdatedBy,
    };
  }
}
