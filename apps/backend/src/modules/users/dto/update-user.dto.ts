import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsIn } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ enum: ['ADMIN', 'OPERATOR'] })
  @IsOptional()
  @IsIn(['ADMIN', 'OPERATOR'])
  role?: 'ADMIN' | 'OPERATOR';

  @ApiPropertyOptional({ enum: ['ACTIVE', 'INVITED', 'DISABLED'] })
  @IsOptional()
  @IsIn(['ACTIVE', 'INVITED', 'DISABLED'])
  status?: 'ACTIVE' | 'INVITED' | 'DISABLED';
}
