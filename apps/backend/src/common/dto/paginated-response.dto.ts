import { ApiProperty } from '@nestjs/swagger';

class PaginationMetaDto {
  @ApiProperty()
  page!: number;

  @ApiProperty()
  pageSize!: number;

  @ApiProperty()
  total!: number;

  @ApiProperty()
  totalPages!: number;
}

export class PaginatedResponseDto<TItem> {
  @ApiProperty({ isArray: true })
  items!: TItem[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}
