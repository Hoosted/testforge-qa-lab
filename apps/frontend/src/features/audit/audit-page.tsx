import { useState } from 'react';
import type { AuditAction, AuditEntityType } from '@testforge/shared-types';
import { useQuery } from '@tanstack/react-query';
import { EmptyState, ErrorState, LoadingState } from '@/components/state-blocks';
import { useAuth } from '@/features/auth/auth-context';
import { listAuditLogs } from '@/features/audit/audit-api';
import { type AuthorizedRequest } from '@/features/products/products-api';
import { formatAuditAction, formatAuditEntity, formatDateTime } from '@/lib/labels';

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
        title="Carregando historico de auditoria"
        description="Reunindo os registros mais recentes das alteracoes importantes do sistema."
        testId="audit-loading"
      />
    );
  }

  if (auditQuery.isError) {
    return (
      <ErrorState
        title="Nao foi possivel carregar a auditoria"
        description="A linha do tempo do sistema esta indisponivel no momento."
        testId="audit-error"
        action={
          <button
            type="button"
            className="primary-button"
            onClick={() => void auditQuery.refetch()}
          >
            Tentar novamente
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
          <p className="eyebrow">Auditoria</p>
          <h2>Acompanhe as principais mudancas da plataforma</h2>
          <p className="muted">
            Use esta pagina para validar rastreabilidade, acessos administrativos e historico de
            alteracoes.
          </p>
        </div>
      </div>

      <div className="panel filters-panel" data-testid="audit-filters">
        <div className="toolbar-grid compact-grid">
          <label className="field">
            Buscar
            <input
              value={filters.search}
              onChange={(event) =>
                setFilters((current) => ({ ...current, search: event.target.value }))
              }
              data-testid="audit-search-input"
            />
          </label>
          <label className="field">
            Entidade
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
              <option value="">Todas</option>
              <option value="PRODUCT">Produto</option>
              <option value="CATEGORY">Categoria</option>
              <option value="SUPPLIER">Fornecedor</option>
              <option value="USER">Usuario</option>
            </select>
          </label>
          <label className="field">
            Acao
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
              <option value="">Todas</option>
              <option value="CREATED">Criacao</option>
              <option value="UPDATED">Atualizacao</option>
              <option value="DELETED">Exclusao</option>
              <option value="PROFILE_UPDATED">Perfil atualizado</option>
              <option value="STATUS_CHANGED">Status alterado</option>
              <option value="ROLE_CHANGED">Perfil alterado</option>
            </select>
          </label>
        </div>
      </div>

      {!data || data.items.length === 0 ? (
        <EmptyState
          title="Nenhum registro de auditoria encontrado"
          description="Amplie os filtros para visualizar mais atividades do sistema."
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
                    {formatAuditEntity(item.entityType)} · {formatAuditAction(item.action)}
                  </p>
                </div>
                <div className="muted">{formatDateTime(item.createdAt)}</div>
              </div>
              <p className="muted">
                Responsavel:{' '}
                {item.actor
                  ? `${item.actor.name}${item.actor.email ? ` (${item.actor.email})` : ''}`
                  : 'Sistema'}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
