import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { mkdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import type { AuthJwtPayload } from '../auth/auth.service';
import { AuthMessageResponseDto } from '../auth/dto/auth-message-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { ListProductsQueryDto } from './dto/list-products-query.dto';
import { ProductMetadataResponseDto } from './dto/product-metadata-response.dto';
import { ProductResponseDto, ProductValidationResponseDto } from './dto/product-response.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

const uploadDirectory = join(process.cwd(), 'apps', 'backend', 'uploads', 'products');
mkdirSync(uploadDirectory, { recursive: true });

@ApiTags('products')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller({
  path: 'products',
  version: '1',
})
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List products with filters, pagination and sorting' })
  @ApiOkResponse({ type: PaginatedResponseDto<ProductResponseDto> })
  listProducts(@Query() query: ListProductsQueryDto) {
    return this.productsService.listProducts(query);
  }

  @Get('metadata')
  @ApiOperation({ summary: 'Return metadata used by product screens' })
  @ApiOkResponse({ type: ProductMetadataResponseDto })
  getMetadata(@Query('simulateError') simulateError?: string) {
    return this.productsService.getMetadata(simulateError);
  }

  @Get('metadata/suppliers')
  @ApiOperation({ summary: 'Return recommended suppliers for a category' })
  @ApiOkResponse({ type: [ProductResponseDto] })
  getSuppliersForCategory(@Query('categoryId') categoryId?: string) {
    return this.productsService.getSuppliersForCategory(categoryId);
  }

  @Get('validation/sku-availability')
  @ApiOperation({ summary: 'Validate SKU availability asynchronously' })
  @ApiOkResponse({ type: ProductValidationResponseDto })
  validateSkuAvailability(
    @Query('value') value?: string,
    @Query('excludeId') excludeId?: string,
    @Query('simulateError') simulateError?: string,
  ) {
    return this.productsService.validateSkuAvailability(value, excludeId, simulateError);
  }

  @Get('validation/related-products')
  @ApiOperation({ summary: 'Search products to power dynamic related SKU selectors' })
  @ApiOkResponse({ type: [ProductResponseDto] })
  searchRelatedProducts(
    @Query('search') search?: string,
    @Query('excludeSku') excludeSku?: string,
  ) {
    return this.productsService.searchRelatedProducts(search, excludeSku);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product details' })
  @ApiOkResponse({ type: ProductResponseDto })
  getProduct(@Param('id') productId: string, @Query('simulateError') simulateError?: string) {
    return this.productsService.getProduct(productId, simulateError);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create a new product' })
  @ApiOkResponse({ type: ProductResponseDto })
  createProduct(
    @Body() body: CreateProductDto,
    @CurrentUser() actor: AuthJwtPayload,
    @Query('simulateError') simulateError?: string,
  ) {
    return this.productsService.createProduct(body, actor, simulateError);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update an existing product' })
  @ApiOkResponse({ type: ProductResponseDto })
  updateProduct(
    @Param('id') productId: string,
    @Body() body: UpdateProductDto,
    @CurrentUser() actor: AuthJwtPayload,
    @Query('simulateError') simulateError?: string,
  ) {
    return this.productsService.updateProduct(productId, body, actor, simulateError);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete a product' })
  @ApiOkResponse({ type: AuthMessageResponseDto })
  deleteProduct(
    @Param('id') productId: string,
    @CurrentUser() actor: AuthJwtPayload,
    @Query('simulateError') simulateError?: string,
  ) {
    return this.productsService.deleteProduct(productId, actor, simulateError);
  }

  @Post(':id/image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload or replace the main product image' })
  @ApiOkResponse({ type: ProductResponseDto })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: uploadDirectory,
        filename: (_request, file, callback) => {
          callback(
            null,
            `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`,
          );
        },
      }),
      limits: { fileSize: 3 * 1024 * 1024 },
    }),
  )
  uploadImage(
    @Param('id') productId: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUser() actor: AuthJwtPayload,
    @Query('simulateError') simulateError?: string,
  ) {
    if (!file) {
      throw new BadRequestException('An image file is required');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Only image uploads are allowed');
    }

    return this.productsService.updateProductImage(
      productId,
      `/uploads/products/${file.filename}`,
      actor,
      simulateError,
    );
  }
}
