import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Prisma as PrismaNamespace } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthJwtPayload } from '../auth/auth.service';
import type { CreateProductDto } from './dto/create-product.dto';
import type { ListProductsQueryDto } from './dto/list-products-query.dto';
import type { UpdateProductDto } from './dto/update-product.dto';

const productInclude = Prisma.validator<PrismaNamespace.ProductInclude>()({
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
});

type ProductWithRelations = PrismaNamespace.ProductGetPayload<{
  include: typeof productInclude;
}>;

@Injectable()
export class ProductsService {
  constructor(private readonly prismaService: PrismaService) {}

  async listProducts(query: ListProductsQueryDto) {
    this.maybeThrowSimulatedError(query.simulateError);

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
        include: productInclude,
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

  async getProduct(productId: string, simulateError?: string) {
    this.maybeThrowSimulatedError(simulateError);

    const product = await this.prismaService.product.findUnique({
      where: { id: productId },
      include: productInclude,
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.mapProduct(product);
  }

  async createProduct(payload: CreateProductDto, actor: AuthJwtPayload, simulateError?: string) {
    this.maybeThrowSimulatedError(simulateError);
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
        promotionEndsAt: payload.promotionEndsAt ? new Date(payload.promotionEndsAt) : null,
        cost: new Prisma.Decimal(payload.cost),
        stockQuantity: payload.stockQuantity,
        category: {
          connect: { id: payload.categoryId },
        },
        supplier: {
          connect: { id: payload.supplierId },
        },
        status: payload.status,
        isActive: payload.isActive,
        deactivationReason: payload.deactivationReason ?? null,
        weight: new Prisma.Decimal(payload.weight),
        width: new Prisma.Decimal(payload.width),
        height: new Prisma.Decimal(payload.height),
        length: new Prisma.Decimal(payload.length),
        barcode: payload.barcode ?? null,
        expirationDate: payload.expirationDate ? new Date(payload.expirationDate) : null,
        featureBullets: payload.featureBullets,
        relatedSkus: payload.relatedSkus,
        createdBy: {
          connect: { id: actor.sub },
        },
        lastUpdatedBy: {
          connect: { id: actor.sub },
        },
        productTags: {
          create: (payload.tagIds ?? []).map((tagId) => ({ tagId })),
        },
      },
      include: productInclude,
    });

    return this.mapProduct(product);
  }

  async updateProduct(
    productId: string,
    payload: UpdateProductDto,
    actor: AuthJwtPayload,
    simulateError?: string,
  ) {
    this.maybeThrowSimulatedError(simulateError);

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
      featureBullets: payload.featureBullets ?? existingProduct.featureBullets,
      relatedSkus: payload.relatedSkus ?? existingProduct.relatedSkus,
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
        ...(payload.promotionEndsAt !== undefined
          ? {
              promotionEndsAt: payload.promotionEndsAt ? new Date(payload.promotionEndsAt) : null,
            }
          : {}),
        ...(payload.cost !== undefined ? { cost: new Prisma.Decimal(payload.cost) } : {}),
        ...(payload.stockQuantity !== undefined ? { stockQuantity: payload.stockQuantity } : {}),
        ...(payload.categoryId !== undefined
          ? {
              category: {
                connect: { id: payload.categoryId },
              },
            }
          : {}),
        ...(payload.supplierId !== undefined
          ? {
              supplier: {
                connect: { id: payload.supplierId },
              },
            }
          : {}),
        ...(payload.status !== undefined ? { status: payload.status } : {}),
        ...(payload.isActive !== undefined ? { isActive: payload.isActive } : {}),
        ...(payload.deactivationReason !== undefined
          ? { deactivationReason: payload.deactivationReason || null }
          : {}),
        ...(payload.weight !== undefined ? { weight: new Prisma.Decimal(payload.weight) } : {}),
        ...(payload.width !== undefined ? { width: new Prisma.Decimal(payload.width) } : {}),
        ...(payload.height !== undefined ? { height: new Prisma.Decimal(payload.height) } : {}),
        ...(payload.length !== undefined ? { length: new Prisma.Decimal(payload.length) } : {}),
        ...(payload.barcode !== undefined ? { barcode: payload.barcode || null } : {}),
        ...(payload.expirationDate !== undefined
          ? { expirationDate: payload.expirationDate ? new Date(payload.expirationDate) : null }
          : {}),
        ...(payload.featureBullets !== undefined ? { featureBullets: payload.featureBullets } : {}),
        ...(payload.relatedSkus !== undefined ? { relatedSkus: payload.relatedSkus } : {}),
        lastUpdatedBy: {
          connect: { id: actor.sub },
        },
        ...(payload.tagIds
          ? {
              productTags: {
                deleteMany: {},
                create: payload.tagIds.map((tagId) => ({ tagId })),
              },
            }
          : {}),
      },
      include: productInclude,
    });

    return this.mapProduct(product);
  }

  async deleteProduct(productId: string, simulateError?: string) {
    this.maybeThrowSimulatedError(simulateError);

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

  async updateProductImage(
    productId: string,
    imageUrl: string,
    actor: AuthJwtPayload,
    simulateError?: string,
  ) {
    this.maybeThrowSimulatedError(simulateError);

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
        lastUpdatedBy: {
          connect: { id: actor.sub },
        },
      },
      include: productInclude,
    });

    return this.mapProduct(product);
  }

  async getMetadata(simulateError?: string) {
    this.maybeThrowSimulatedError(simulateError);

    const [categories, suppliers, tags, products] = await Promise.all([
      this.prismaService.category.findMany({ orderBy: { name: 'asc' } }),
      this.prismaService.supplier.findMany({ orderBy: { name: 'asc' } }),
      this.prismaService.tag.findMany({ orderBy: { name: 'asc' } }),
      this.prismaService.product.findMany({
        select: {
          categoryId: true,
          supplier: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
    ]);

    const recommendedSuppliersByCategory = categories.map((category) => {
      const recommended = products
        .filter((product) => product.categoryId === category.id)
        .map((product) => product.supplier)
        .filter(
          (supplier, index, collection) =>
            collection.findIndex((item) => item.id === supplier.id) === index,
        );

      return {
        categoryId: category.id,
        suppliers:
          recommended.length > 0 ? recommended : suppliers.map(({ id, name }) => ({ id, name })),
      };
    });

    return {
      categories,
      suppliers,
      tags,
      statuses: ['DRAFT', 'READY', 'ARCHIVED'],
      recommendedSuppliersByCategory,
    };
  }

  async getSuppliersForCategory(categoryId?: string) {
    if (!categoryId) {
      return this.prismaService.supplier.findMany({
        orderBy: { name: 'asc' },
        select: { id: true, name: true },
      });
    }

    const products = await this.prismaService.product.findMany({
      where: { categoryId },
      select: {
        supplier: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      distinct: ['supplierId'],
    });

    if (products.length === 0) {
      return this.prismaService.supplier.findMany({
        orderBy: { name: 'asc' },
        select: { id: true, name: true },
      });
    }

    return products.map((item) => item.supplier);
  }

  async validateSkuAvailability(value?: string, excludeId?: string, simulateError?: string) {
    this.maybeThrowSimulatedError(simulateError);

    if (!value || value.trim().length < 3) {
      return {
        available: false,
        reason: 'SKU must have at least 3 characters',
      };
    }

    const existingSku = await this.prismaService.product.findFirst({
      where: {
        sku: value.trim(),
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });

    return {
      available: !existingSku,
      reason: existingSku ? 'SKU is already in use' : null,
    };
  }

  async searchRelatedProducts(search?: string, excludeSku?: string) {
    const normalizedSearch = search?.trim();

    if (!normalizedSearch || normalizedSearch.length < 2) {
      return [];
    }

    return this.prismaService.product.findMany({
      where: {
        OR: [
          { name: { contains: normalizedSearch, mode: 'insensitive' } },
          { sku: { contains: normalizedSearch, mode: 'insensitive' } },
        ],
        ...(excludeSku ? { NOT: { sku: excludeSku } } : {}),
      },
      orderBy: { updatedAt: 'desc' },
      take: 8,
      select: {
        id: true,
        sku: true,
        name: true,
      },
    });
  }

  private async validateBusinessRules(payload: {
    sku?: string;
    price?: string | Prisma.Decimal;
    promotionalPrice?: string | Prisma.Decimal | null;
    promotionEndsAt?: string | Date | null;
    stockQuantity?: number;
    categoryId?: string;
    supplierId?: string;
    status?: string;
    isActive?: boolean;
    deactivationReason?: string | null;
    tagIds?: string[];
    barcode?: string | null;
    expirationDate?: string | Date | null;
    featureBullets?: string[];
    relatedSkus?: string[];
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

    if (promotionalValue !== null && !payload.promotionEndsAt) {
      throw new BadRequestException('Promotion end date is required when promotional price is set');
    }

    if (payload.promotionEndsAt) {
      const promotionDate = new Date(payload.promotionEndsAt);
      if (Number.isNaN(promotionDate.getTime()) || promotionDate <= new Date()) {
        throw new BadRequestException('Promotion end date must be in the future');
      }
    }

    if (payload.isActive === false && !payload.deactivationReason?.trim()) {
      throw new BadRequestException('Deactivation reason is required for inactive products');
    }

    if (payload.status === 'READY' && !payload.barcode?.trim()) {
      throw new BadRequestException('Barcode is required when the product is READY');
    }

    let categoryName: string | null = null;
    if (payload.categoryId) {
      const category = await this.prismaService.category.findUnique({
        where: { id: payload.categoryId },
        select: { id: true, name: true },
      });
      if (!category) {
        throw new BadRequestException('Category not found');
      }
      categoryName = category.name;
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

    if (categoryName === 'Grocery' && !payload.expirationDate) {
      throw new BadRequestException('Expiration date is required for grocery products');
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

    if (payload.featureBullets && payload.featureBullets.some((item) => item.trim().length < 3)) {
      throw new BadRequestException('Feature bullets must contain at least 3 characters');
    }

    if (
      payload.status === 'READY' &&
      (!payload.featureBullets || payload.featureBullets.length === 0)
    ) {
      throw new BadRequestException('At least one feature bullet is required for READY products');
    }

    if (payload.relatedSkus && payload.relatedSkus.length > 0) {
      const uniqueSkus = [...new Set(payload.relatedSkus.filter(Boolean))];
      if (payload.sku && uniqueSkus.includes(payload.sku)) {
        throw new BadRequestException('A product cannot reference its own SKU as related');
      }

      const relatedProductsCount = await this.prismaService.product.count({
        where: {
          sku: {
            in: uniqueSkus,
          },
        },
      });

      if (relatedProductsCount !== uniqueSkus.length) {
        throw new BadRequestException('One or more related SKUs could not be found');
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

  private maybeThrowSimulatedError(simulateError?: string) {
    if (!simulateError || process.env.NODE_ENV === 'production') {
      return;
    }

    const errorMap = {
      '400': () => {
        throw new BadRequestException('Simulated 400 error for automation testing');
      },
      '401': () => {
        throw new UnauthorizedException('Simulated 401 error for automation testing');
      },
      '403': () => {
        throw new ForbiddenException('Simulated 403 error for automation testing');
      },
      '404': () => {
        throw new NotFoundException('Simulated 404 error for automation testing');
      },
      '409': () => {
        throw new ConflictException('Simulated 409 error for automation testing');
      },
      '500': () => {
        throw new InternalServerErrorException('Simulated 500 error for automation testing');
      },
    } as const;

    errorMap[simulateError as keyof typeof errorMap]?.();
  }

  private mapProduct(product: ProductWithRelations) {
    return {
      id: product.id,
      name: product.name,
      sku: product.sku,
      shortDescription: product.shortDescription,
      longDescription: product.longDescription,
      price: product.price.toString(),
      promotionalPrice: product.promotionalPrice?.toString() ?? null,
      promotionEndsAt: product.promotionEndsAt?.toISOString() ?? null,
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
      deactivationReason: product.deactivationReason ?? null,
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
      featureBullets: product.featureBullets,
      relatedSkus: product.relatedSkus,
      imageUrl: product.imageUrl ?? null,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
      createdBy: product.createdBy,
      lastUpdatedBy: product.lastUpdatedBy,
    };
  }
}
