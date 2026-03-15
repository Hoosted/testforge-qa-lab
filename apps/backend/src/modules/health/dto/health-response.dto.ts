import { ApiProperty } from '@nestjs/swagger';

class HealthDatabaseDto {
  @ApiProperty({ example: 'up' })
  status!: 'up' | 'down';
}

export class HealthResponseDto {
  @ApiProperty({ example: 'ok' })
  status!: 'ok' | 'error';

  @ApiProperty({ example: 'testforge-api' })
  service!: string;

  @ApiProperty({ example: '0.1.0' })
  version!: string;

  @ApiProperty({ example: '2026-03-14T22:00:00.000Z' })
  timestamp!: string;

  @ApiProperty({ example: 'development' })
  environment!: string;

  @ApiProperty({ type: HealthDatabaseDto })
  database!: HealthDatabaseDto;
}
