import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  IsDateString,
  IsIn,
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
}
