import { useState } from 'react';
import type { AuditAction, AuditEntityType } from '@testforge/shared-types';
import { useQuery } from '@tanstack/react-query';
import { EmptyState, ErrorState, LoadingState } from '@/components/state-blocks';
import { useAuth } from '@/features/auth/auth-context';
import { listAuditLogs } from '@/features/audit/audit-api';
import { type AuthorizedRequest } from '@/features/products/products-api';

export function AuditPage() {
  const { fetchWithAuth } = useAuth();
  const [filters, setFilters] = useState<{
    entityType: AuditEntityType | '';
    action: AuditAction | '';
    search: string;
  }>({
    entityType: '',
    action: '',
    search: '',
  });

  const auditQuery = useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: () =>
      listAuditLogs(fetchWithAuth as AuthorizedRequest, {
        page: 1,
        pageSize: 20,
        ...filters,
      }),
  });

  if (auditQuery.isLoading) {
    return (
      <LoadingState
        title="Loading audit history"
        description="Collecting the latest trace of important domain changes."
        testId="audit-loading"
      />
    );
  }

  if (auditQuery.isError) {
    return (
      <ErrorState
        title="Unable to load audit history"
        description="The system audit timeline is currently unavailable."
        testId="audit-error"
        action={
          <button
            type="button"
            className="primary-button"
            onClick={() => void auditQuery.refetch()}
          >
            Retry
          </button>
        }
      />
    );
  }

  const data = auditQuery.data;

  return (
    <section className="dashboard-grid" data-testid="audit-page">
      <div className="panel section-header">
        <div>
          <p className="eyebrow">Audit</p>
          <h2>Review the important changes across the platform</h2>
          <p className="muted">
            Use this page for access control, traceability and history assertions.
          </p>
        </div>
      </div>

      <div className="panel filters-panel" data-testid="audit-filters">
        <div className="toolbar-grid compact-grid">
          <label className="field">
            Search
            <input
              value={filters.search}
              onChange={(event) =>
                setFilters((current) => ({ ...current, search: event.target.value }))
              }
              data-testid="audit-search-input"
            />
          </label>
          <label className="field">
            Entity
            <select
              value={filters.entityType}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  entityType: event.target.value as AuditEntityType | '',
                }))
              }
              data-testid="audit-entity-filter"
            >
              <option value="">All</option>
              <option value="PRODUCT">PRODUCT</option>
              <option value="CATEGORY">CATEGORY</option>
              <option value="SUPPLIER">SUPPLIER</option>
              <option value="USER">USER</option>
            </select>
          </label>
          <label className="field">
            Action
            <select
              value={filters.action}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  action: event.target.value as AuditAction | '',
                }))
              }
              data-testid="audit-action-filter"
            >
              <option value="">All</option>
              <option value="CREATED">CREATED</option>
              <option value="UPDATED">UPDATED</option>
              <option value="DELETED">DELETED</option>
              <option value="PROFILE_UPDATED">PROFILE_UPDATED</option>
              <option value="STATUS_CHANGED">STATUS_CHANGED</option>
              <option value="ROLE_CHANGED">ROLE_CHANGED</option>
            </select>
          </label>
        </div>
      </div>

      {!data || data.items.length === 0 ? (
        <EmptyState
          title="No audit entries found"
          description="Try broadening the filters to inspect more system activity."
          testId="audit-empty"
        />
      ) : (
        <div className="panel audit-list" data-testid="audit-list">
          {data.items.map((item) => (
            <article key={item.id} className="audit-item" data-testid={`audit-item-${item.id}`}>
              <div className="audit-item-header">
                <div>
                  <strong>{item.summary}</strong>
                  <p className="muted">
                    {item.entityType} · {item.action}
                  </p>
                </div>
                <div className="muted">{new Date(item.createdAt).toLocaleString()}</div>
              </div>
              <p className="muted">
                Actor:{' '}
                {item.actor
                  ? `${item.actor.name}${item.actor.email ? ` (${item.actor.email})` : ''}`
                  : 'System'}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
