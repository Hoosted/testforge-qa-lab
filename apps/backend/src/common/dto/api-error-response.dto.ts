import { ApiProperty } from '@nestjs/swagger';

export class ApiErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode!: number;

  @ApiProperty({ example: '/api/v1/health' })
  path!: string;

  @ApiProperty({ example: '2026-03-14T22:00:00.000Z' })
  timestamp!: string;

  @ApiProperty({ example: 'Bad request' })
  message!: string | string[];
}
