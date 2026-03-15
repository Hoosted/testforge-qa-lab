import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBooleanString, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ListProductsQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 10;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ['DRAFT', 'READY', 'ARCHIVED'] })
  @IsOptional()
  @IsIn(['DRAFT', 'READY', 'ARCHIVED'])
  status?: 'DRAFT' | 'READY' | 'ARCHIVED';

  @ApiPropertyOptional()
  @IsOptional()
  @IsBooleanString()
  isActive?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  supplierId?: string;

  @ApiPropertyOptional({ description: 'Comma separated tag ids' })
  @IsOptional()
  @IsString()
  tagIds?: string;

  @ApiPropertyOptional({ enum: ['name', 'price', 'stockQuantity', 'createdAt', 'updatedAt'] })
  @IsOptional()
  @IsIn(['name', 'price', 'stockQuantity', 'createdAt', 'updatedAt'])
  sortBy?: 'name' | 'price' | 'stockQuantity' | 'createdAt' | 'updatedAt' = 'createdAt';

  @ApiPropertyOptional({ enum: ['asc', 'desc'] })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({ enum: ['400', '401', '403', '404', '409', '500'] })
  @IsOptional()
  @IsIn(['400', '401', '403', '404', '409', '500'])
  simulateError?: '400' | '401' | '403' | '404' | '409' | '500';
}
