import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ListUsersQuery, UpdateUserRequest, UserListItem } from '@testforge/shared-types';
import { EmptyState, ErrorState, LoadingState } from '@/components/state-blocks';
import { useAuth } from '@/features/auth/auth-context';
import { useToast } from '@/features/ui/toast-context';

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
      pushToast({ title: 'User updated', description: 'Role and status changes were saved.' });
      void queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      pushToast({
        title: 'Unable to update user',
        description: error instanceof Error ? error.message : 'Try again shortly.',
        variant: 'error',
      });
    },
  });

  if (usersQuery.isLoading) {
    return (
      <LoadingState
        title="Loading user management"
        description="Fetching admin-only account management data."
        testId="users-loading"
      />
    );
  }

  if (usersQuery.isError) {
    return (
      <ErrorState
        title="Unable to load users"
        description="Admin management data is currently unavailable."
        testId="users-error"
        action={
          <button
            type="button"
            className="primary-button"
            onClick={() => void usersQuery.refetch()}
          >
            Retry
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
          <p className="eyebrow">Admin users</p>
          <h2>Restrict account governance to admins only</h2>
          <p className="muted">
            This screen exercises role-based access control and predictable test data.
          </p>
        </div>
      </div>

      <div className="panel filters-panel" data-testid="users-filters">
        <div className="toolbar-grid compact-grid">
          <label className="field">
            Search
            <input
              value={query.search ?? ''}
              onChange={(event) =>
                setQuery((current) => ({ ...current, page: 1, search: event.target.value }))
              }
              data-testid="users-search-input"
            />
          </label>
          <label className="field">
            Role
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
              <option value="">All</option>
              <option value="ADMIN">ADMIN</option>
              <option value="OPERATOR">OPERATOR</option>
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
              <option value="">All</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INVITED">INVITED</option>
              <option value="DISABLED">DISABLED</option>
            </select>
          </label>
        </div>
      </div>

      {data.items.length === 0 ? (
        <EmptyState
          title="No users found"
          description="Try a broader search or clear the current admin filters."
          testId="users-empty"
        />
      ) : (
        <div className="panel table-panel" data-testid="users-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last login</th>
                <th>Actions</th>
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
          <strong>{data.meta.total}</strong> users
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
            Previous
          </button>
          <span data-testid="users-current-page">Page {data.meta.page}</span>
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
            Next
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
          <option value="ADMIN">ADMIN</option>
          <option value="OPERATOR">OPERATOR</option>
        </select>
      </td>
      <td>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as UserListItem['status'])}
        >
          <option value="ACTIVE">ACTIVE</option>
          <option value="INVITED">INVITED</option>
          <option value="DISABLED">DISABLED</option>
        </select>
      </td>
      <td>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}</td>
      <td>
        <button
          type="button"
          className="ghost-button"
          onClick={() => onSave({ role, status })}
          disabled={isSaving}
          data-testid={`save-user-button-${user.id}`}
        >
          Save
        </button>
      </td>
    </tr>
  );
}
