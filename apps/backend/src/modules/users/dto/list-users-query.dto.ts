import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ListUsersQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 10;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ['ADMIN', 'OPERATOR'] })
  @IsOptional()
  @IsIn(['ADMIN', 'OPERATOR'])
  role?: 'ADMIN' | 'OPERATOR';

  @ApiPropertyOptional({ enum: ['ACTIVE', 'INVITED', 'DISABLED'] })
  @IsOptional()
  @IsIn(['ACTIVE', 'INVITED', 'DISABLED'])
  status?: 'ACTIVE' | 'INVITED' | 'DISABLED';
}
