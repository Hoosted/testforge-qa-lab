import { useQuery } from '@tanstack/react-query';
import type { AuthMessageResponse } from '@testforge/shared-types';
import { useAuth } from './auth-context';

export function OperatorPage() {
  const { fetchWithAuth } = useAuth();
  const operatorQuery = useQuery({
    queryKey: ['operator-access'],
    queryFn: () => fetchWithAuth<AuthMessageResponse>('/auth/operator/access'),
  });

  return (
    <section className="panel protected-panel" data-testid="operator-page">
      <p className="eyebrow">Operator route</p>
      <h2>Protected operator workflow</h2>
      {operatorQuery.isLoading ? <p className="muted">Checking operator access...</p> : null}
      {operatorQuery.isError ? (
        <p className="form-alert" data-testid="operator-error">
          Unable to validate operator access right now.
        </p>
      ) : null}
      {operatorQuery.data ? (
        <p className="status-chip" data-testid="operator-success">
          {operatorQuery.data.message}
        </p>
      ) : null}
    </section>
  );
}
