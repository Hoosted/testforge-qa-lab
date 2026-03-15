import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@testforge.local' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'TestForge@123' })
  @IsString()
  @MinLength(8)
  password!: string;
}
