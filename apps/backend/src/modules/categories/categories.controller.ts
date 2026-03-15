import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import type { AuthJwtPayload } from '../auth/auth.service';
import { AuthMessageResponseDto } from '../auth/dto/auth-message-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('categories')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller({
  path: 'categories',
  version: '1',
})
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'List categories used by products and admin catalog management' })
  @ApiOkResponse({ type: [CategoryResponseDto] })
  listCategories() {
    return this.categoriesService.listCategories();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create a category' })
  @ApiOkResponse({ type: CategoryResponseDto })
  createCategory(@Body() body: CreateCategoryDto, @CurrentUser() actor: AuthJwtPayload) {
    return this.categoriesService.createCategory(body, actor);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update a category' })
  @ApiOkResponse({ type: CategoryResponseDto })
  updateCategory(
    @Param('id') categoryId: string,
    @Body() body: UpdateCategoryDto,
    @CurrentUser() actor: AuthJwtPayload,
  ) {
    return this.categoriesService.updateCategory(categoryId, body, actor);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete a category' })
  @ApiOkResponse({ type: AuthMessageResponseDto })
  deleteCategory(@Param('id') categoryId: string, @CurrentUser() actor: AuthJwtPayload) {
    return this.categoriesService.deleteCategory(categoryId, actor);
  }
}
