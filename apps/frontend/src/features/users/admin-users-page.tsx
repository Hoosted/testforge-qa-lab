import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ListUsersQuery, UpdateUserRequest, UserListItem } from '@testforge/shared-types';
import { EmptyState, ErrorState, LoadingState } from '@/components/state-blocks';
import { useAuth } from '@/features/auth/auth-context';
import { useToast } from '@/features/ui/toast-context';
import { formatDateTime, formatRoleLabel, formatUserStatus } from '@/lib/labels';

function buildUsersQuery(query: ListUsersQuery) {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.set(key, String(value));
    }
  });

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

interface UsersResponse {
  items: UserListItem[];
  meta: {
    page: number;
    totalPages: number;
    total: number;
  };
}

export function AdminUsersPage() {
  const { fetchWithAuth } = useAuth();
  const { pushToast } = useToast();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState<ListUsersQuery>({
    page: 1,
    pageSize: 10,
    search: '',
    role: '',
    status: '',
  });

  const usersQuery = useQuery({
    queryKey: ['users', query],
    queryFn: () => fetchWithAuth<UsersResponse>(`/users${buildUsersQuery(query)}`),
  });

  const updateMutation = useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: UpdateUserRequest }) =>
      fetchWithAuth(`/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      pushToast({
        title: 'Usuario atualizado',
        description: 'As alteracoes foram salvas com sucesso.',
      });
      void queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      pushToast({
        title: 'Nao foi possivel atualizar o usuario',
        description:
          error instanceof Error ? error.message : 'Tente novamente em alguns instantes.',
        variant: 'error',
      });
    },
  });

  if (usersQuery.isLoading) {
    return (
      <LoadingState
        title="Carregando gestao de usuarios"
        description="Buscando os dados administrativos das contas cadastradas."
        testId="users-loading"
      />
    );
  }

  if (usersQuery.isError) {
    return (
      <ErrorState
        title="Nao foi possivel carregar os usuarios"
        description="Os dados administrativos de contas estao indisponiveis no momento."
        testId="users-error"
        action={
          <button
            type="button"
            className="primary-button"
            onClick={() => void usersQuery.refetch()}
          >
            Tentar novamente
          </button>
        }
      />
    );
  }

  const data = usersQuery.data;

  if (!data) {
    return null;
  }

  return (
    <section className="dashboard-grid" data-testid="users-management-page">
      <div className="panel section-header">
        <div>
          <p className="eyebrow">Usuarios</p>
          <h2>Controle perfis, status e governanca de acesso</h2>
          <p className="muted">
            Esta tela facilita a validacao de RBAC, estados de conta e alteracoes administrativas.
          </p>
        </div>
      </div>

      <div className="panel filters-panel" data-testid="users-filters">
        <div className="toolbar-grid compact-grid">
          <label className="field">
            Buscar
            <input
              value={query.search ?? ''}
              onChange={(event) =>
                setQuery((current) => ({ ...current, page: 1, search: event.target.value }))
              }
              data-testid="users-search-input"
            />
          </label>
          <label className="field">
            Perfil
            <select
              value={query.role ?? ''}
              onChange={(event) =>
                setQuery((current) => ({
                  ...current,
                  page: 1,
                  role: event.target.value as NonNullable<ListUsersQuery['role']>,
                }))
              }
              data-testid="users-role-filter"
            >
              <option value="">Todos</option>
              <option value="ADMIN">Administrador</option>
              <option value="OPERATOR">Operador</option>
            </select>
          </label>
          <label className="field">
            Status
            <select
              value={query.status ?? ''}
              onChange={(event) =>
                setQuery((current) => ({
                  ...current,
                  page: 1,
                  status: event.target.value as NonNullable<ListUsersQuery['status']>,
                }))
              }
              data-testid="users-status-filter"
            >
              <option value="">Todos</option>
              <option value="ACTIVE">Ativo</option>
              <option value="INVITED">Convidado</option>
              <option value="DISABLED">Desativado</option>
            </select>
          </label>
        </div>
      </div>

      {data.items.length === 0 ? (
        <EmptyState
          title="Nenhum usuario encontrado"
          description="Tente ampliar a busca ou limpar os filtros aplicados."
          testId="users-empty"
        />
      ) : (
        <div className="panel table-panel" data-testid="users-table">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Perfil</th>
                <th>Status</th>
                <th>Ultimo acesso</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  onSave={(payload) => updateMutation.mutate({ userId: user.id, payload })}
                  isSaving={updateMutation.isPending}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="panel pagination-panel">
        <div>
          <strong>{data.meta.total}</strong> usuarios cadastrados
        </div>
        <div className="action-row">
          <button
            type="button"
            className="ghost-button"
            onClick={() =>
              setQuery((current) => ({ ...current, page: Math.max(1, (current.page ?? 1) - 1) }))
            }
            disabled={(query.page ?? 1) <= 1}
          >
            Anterior
          </button>
          <span data-testid="users-current-page">Pagina {data.meta.page}</span>
          <button
            type="button"
            className="ghost-button"
            onClick={() =>
              setQuery((current) => ({
                ...current,
                page: Math.min(data.meta.totalPages, (current.page ?? 1) + 1),
              }))
            }
            disabled={data.meta.page >= data.meta.totalPages}
          >
            Proxima
          </button>
        </div>
      </div>
    </section>
  );
}

function UserRow({
  user,
  onSave,
  isSaving,
}: {
  user: UserListItem;
  onSave: (payload: UpdateUserRequest) => void;
  isSaving: boolean;
}) {
  const [role, setRole] = useState(user.role);
  const [status, setStatus] = useState(user.status);

  return (
    <tr data-testid={`user-row-${user.id}`}>
      <td>{user.name}</td>
      <td>{user.email}</td>
      <td>
        <select
          value={role}
          onChange={(event) => setRole(event.target.value as UserListItem['role'])}
        >
          <option value="ADMIN">Administrador</option>
          <option value="OPERATOR">Operador</option>
        </select>
      </td>
      <td>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as UserListItem['status'])}
        >
          <option value="ACTIVE">Ativo</option>
          <option value="INVITED">Convidado</option>
          <option value="DISABLED">Desativado</option>
        </select>
      </td>
      <td>{formatDateTime(user.lastLoginAt)}</td>
      <td>
        <div className="section-stack">
          <span className="muted">
            {formatRoleLabel(user.role)} · {formatUserStatus(user.status)}
          </span>
          <button
            type="button"
            className="ghost-button"
            onClick={() => onSave({ role, status })}
            disabled={isSaving}
            data-testid={`save-user-button-${user.id}`}
          >
            Salvar
          </button>
        </div>
      </td>
    </tr>
  );
}
