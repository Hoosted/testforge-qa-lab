import { ApiProperty } from '@nestjs/swagger';

class PermissionDto {
  @ApiProperty({ example: true })
  canAccessAdminArea!: boolean;

  @ApiProperty({ example: true })
  canAccessOperatorArea!: boolean;

  @ApiProperty({ example: true })
  canManageProducts!: boolean;
}

export class AuthUserDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({ enum: ['ADMIN', 'OPERATOR'] })
  role!: 'ADMIN' | 'OPERATOR';

  @ApiProperty({ type: PermissionDto })
  permissions!: PermissionDto;
}
