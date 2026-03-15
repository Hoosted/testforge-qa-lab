import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  sku!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(180)
  shortDescription!: string;

  @ApiProperty()
  @IsString()
  @MinLength(10)
  longDescription!: string;

  @ApiProperty()
  @IsNumberString()
  price!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString()
  promotionalPrice?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  promotionEndsAt?: string;

  @ApiProperty()
  @IsNumberString()
  cost!: string;

  @ApiProperty()
  @IsInt()
  @Min(0)
  stockQuantity!: number;

  @ApiProperty()
  @IsString()
  categoryId!: string;

  @ApiProperty()
  @IsString()
  supplierId!: string;

  @ApiProperty({ enum: ['DRAFT', 'READY', 'ARCHIVED'] })
  @IsIn(['DRAFT', 'READY', 'ARCHIVED'])
  status!: 'DRAFT' | 'READY' | 'ARCHIVED';

  @ApiProperty()
  @IsBoolean()
  isActive!: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(180)
  deactivationReason?: string;

  @ApiProperty()
  @IsNumberString()
  weight!: string;

  @ApiProperty()
  @IsNumberString()
  width!: string;

  @ApiProperty()
  @IsNumberString()
  height!: string;

  @ApiProperty()
  @IsNumberString()
  length!: string;

  @ApiPropertyOptional({ isArray: true, type: String })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @ApiProperty({ isArray: true, type: String })
  @IsArray()
  @IsString({ each: true })
  featureBullets!: string[];

  @ApiProperty({ isArray: true, type: String })
  @IsArray()
  @IsString({ each: true })
  relatedSkus!: string[];
}
