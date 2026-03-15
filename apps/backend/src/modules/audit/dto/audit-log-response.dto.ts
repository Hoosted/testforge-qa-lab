import { ApiProperty } from '@nestjs/swagger';

class AuditActorDto {
  @ApiProperty({ nullable: true })
  id!: string | null;

  @ApiProperty()
  name!: string;

  @ApiProperty({ nullable: true })
  email!: string | null;
}

export class AuditLogResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: ['PRODUCT', 'CATEGORY', 'SUPPLIER', 'USER'] })
  entityType!: 'PRODUCT' | 'CATEGORY' | 'SUPPLIER' | 'USER';

  @ApiProperty()
  entityId!: string;

  @ApiProperty({
    enum: ['CREATED', 'UPDATED', 'DELETED', 'PROFILE_UPDATED', 'STATUS_CHANGED', 'ROLE_CHANGED'],
  })
  action!:
    | 'CREATED'
    | 'UPDATED'
    | 'DELETED'
    | 'PROFILE_UPDATED'
    | 'STATUS_CHANGED'
    | 'ROLE_CHANGED';

  @ApiProperty()
  summary!: string;

  @ApiProperty({ type: AuditActorDto, nullable: true })
  actor!: AuditActorDto | null;

  @ApiProperty({ nullable: true, type: Object })
  before!: Record<string, unknown> | null;

  @ApiProperty({ nullable: true, type: Object })
  after!: Record<string, unknown> | null;

  @ApiProperty()
  createdAt!: string;
}
