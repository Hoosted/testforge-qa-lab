export const auditEntityTypes = ['PRODUCT', 'CATEGORY', 'SUPPLIER', 'USER'] as const;
export const auditActions = [
  'CREATED',
  'UPDATED',
  'DELETED',
  'PROFILE_UPDATED',
  'STATUS_CHANGED',
  'ROLE_CHANGED',
] as const;

export type AuditEntityType = (typeof auditEntityTypes)[number];
export type AuditAction = (typeof auditActions)[number];
