import { ApiProperty } from '@nestjs/swagger';

export class AuthMessageResponseDto {
  @ApiProperty({ example: 'Logged out successfully' })
  message!: string;
}
