import { ApiProperty } from '@nestjs/swagger';

export class UserProfileDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({ enum: ['ADMIN', 'OPERATOR'] })
  role!: 'ADMIN' | 'OPERATOR';

  @ApiProperty({ enum: ['ACTIVE', 'INVITED', 'DISABLED'] })
  status!: 'ACTIVE' | 'INVITED' | 'DISABLED';

  @ApiProperty({ nullable: true })
  lastLoginAt!: string | null;

  @ApiProperty()
  createdAt!: string;
}
