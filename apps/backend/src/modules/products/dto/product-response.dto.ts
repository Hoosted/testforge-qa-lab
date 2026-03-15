import { ApiProperty } from '@nestjs/swagger';

class ProductOptionDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;
}

class ProductTagDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ nullable: true })
  color!: string | null;
}

class ProductAuditUserDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;
}

export class ProductResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  sku!: string;

  @ApiProperty()
  shortDescription!: string;

  @ApiProperty()
  longDescription!: string;

  @ApiProperty()
  price!: string;

  @ApiProperty({ nullable: true })
  promotionalPrice!: string | null;

  @ApiProperty()
  cost!: string;

  @ApiProperty()
  stockQuantity!: number;

  @ApiProperty({ type: ProductOptionDto })
  category!: ProductOptionDto;

  @ApiProperty({ type: ProductOptionDto })
  supplier!: ProductOptionDto;

  @ApiProperty({ enum: ['DRAFT', 'READY', 'ARCHIVED'] })
  status!: 'DRAFT' | 'READY' | 'ARCHIVED';

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  weight!: string;

  @ApiProperty()
  width!: string;

  @ApiProperty()
  height!: string;

  @ApiProperty()
  length!: string;

  @ApiProperty({ isArray: true, type: ProductTagDto })
  tags!: ProductTagDto[];

  @ApiProperty({ nullable: true })
  barcode!: string | null;

  @ApiProperty({ nullable: true })
  expirationDate!: string | null;

  @ApiProperty({ nullable: true })
  imageUrl!: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  @ApiProperty({ type: ProductAuditUserDto })
  createdBy!: ProductAuditUserDto;

  @ApiProperty({ type: ProductAuditUserDto })
  lastUpdatedBy!: ProductAuditUserDto;
}
