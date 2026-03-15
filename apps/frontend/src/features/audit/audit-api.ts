import type { AuditLogQuery, AuditLogRecord, PaginatedResponse } from '@testforge/shared-types';
import type { AuthorizedRequest } from '@/features/products/products-api';

function buildAuditQuery(query: AuditLogQuery) {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.set(key, String(value));
    }
  });

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

export function listAuditLogs(fetchWithAuth: AuthorizedRequest, query: AuditLogQuery) {
  return fetchWithAuth<PaginatedResponse<AuditLogRecord>>(`/audit-logs${buildAuditQuery(query)}`);
}
