import { useQuery } from '@tanstack/react-query';
import type { AuthMessageResponse } from '@testforge/shared-types';
import { useAuth } from './auth-context';

export function AdminPage() {
  const { fetchWithAuth } = useAuth();
  const adminQuery = useQuery({
    queryKey: ['admin-access'],
    queryFn: () => fetchWithAuth<AuthMessageResponse>('/auth/admin/access'),
  });

  return (
    <section className="panel protected-panel" data-testid="admin-page">
      <p className="eyebrow">Admin route</p>
      <h2>Protected admin workflow</h2>
      {adminQuery.isLoading ? <p className="muted">Checking admin access...</p> : null}
      {adminQuery.isError ? (
        <p className="form-alert" data-testid="admin-error">
          Unable to validate admin access right now.
        </p>
      ) : null}
      {adminQuery.data ? (
        <p className="status-chip" data-testid="admin-success">
          {adminQuery.data.message}
        </p>
      ) : null}
    </section>
  );
}
