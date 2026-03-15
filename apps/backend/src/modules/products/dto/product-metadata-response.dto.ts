import { ApiProperty } from '@nestjs/swagger';

class MetadataItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;
}

class MetadataTagItemDto extends MetadataItemDto {
  @ApiProperty({ nullable: true })
  color!: string | null;
}

export class ProductMetadataResponseDto {
  @ApiProperty({ isArray: true, type: MetadataItemDto })
  categories!: MetadataItemDto[];

  @ApiProperty({ isArray: true, type: MetadataItemDto })
  suppliers!: MetadataItemDto[];

  @ApiProperty({ isArray: true, type: MetadataTagItemDto })
  tags!: MetadataTagItemDto[];

  @ApiProperty({ isArray: true, type: String })
  statuses!: string[];
}
