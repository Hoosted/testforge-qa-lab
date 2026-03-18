import type {
  AuditAction,
  AuditEntityType,
  ProductStatus,
  UserRole,
  UserStatus,
} from '@testforge/shared-types';

export function formatRoleLabel(role?: UserRole | null) {
  const labels: Record<UserRole, string> = {
    ADMIN: 'Administrador',
    OPERATOR: 'Operador',
  };

  return role ? labels[role] : '-';
}

export function formatUserStatus(status?: UserStatus | null) {
  const labels: Record<UserStatus, string> = {
    ACTIVE: 'Ativo',
    INVITED: 'Convidado',
    DISABLED: 'Desativado',
  };

  return status ? labels[status] : '-';
}

export function formatProductStatus(status?: ProductStatus | null) {
  const labels: Record<ProductStatus, string> = {
    DRAFT: 'Rascunho',
    READY: 'Pronto',
    ARCHIVED: 'Arquivado',
  };

  return status ? labels[status] : '-';
}

export function formatAuditEntity(entity?: AuditEntityType | null) {
  const labels: Record<AuditEntityType, string> = {
    PRODUCT: 'Produto',
    CATEGORY: 'Categoria',
    SUPPLIER: 'Fornecedor',
    USER: 'Usuario',
  };

  return entity ? labels[entity] : '-';
}

export function formatAuditAction(action?: AuditAction | null) {
  const labels: Record<AuditAction, string> = {
    CREATED: 'Criacao',
    UPDATED: 'Atualizacao',
    DELETED: 'Exclusao',
    PROFILE_UPDATED: 'Perfil atualizado',
    STATUS_CHANGED: 'Status alterado',
    ROLE_CHANGED: 'Perfil de acesso alterado',
  };

  return action ? labels[action] : '-';
}

export function formatDateTime(value?: string | null) {
  if (!value) {
    return 'Nao informado';
  }

  return new Date(value).toLocaleString('pt-BR');
}

export function formatCurrency(value?: number | string | null) {
  if (value === undefined || value === null || value === '') {
    return 'R$ 0,00';
  }

  const numericValue = typeof value === 'string' ? Number(value) : value;

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number.isNaN(numericValue) ? 0 : numericValue);
}
