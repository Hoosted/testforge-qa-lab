import { Link } from 'react-router-dom';
import { useAuth } from './auth-context';

export function DashboardPage() {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <section className="dashboard-grid" data-testid="dashboard-page">
      <div className="panel account-panel">
        <p className="eyebrow">Authenticated session</p>
        <h2 data-testid="current-user-name">{user.name}</h2>
        <div className="account-meta">
          <span className="status-chip" data-testid="current-user-role">
            {user.role}
          </span>
          <span className="muted" data-testid="current-user-email">
            {user.email}
          </span>
        </div>
        <p className="muted">
          This dashboard is protected. Refresh the page to verify that the session is restored by
          the refresh token flow.
        </p>
        <button className="ghost-button" onClick={() => void logout()} data-testid="logout-button">
          Logout
        </button>
      </div>

      <div className="panel">
        <p className="eyebrow">Permissions</p>
        <div className="status-grid">
          <article className="status-card" data-testid="permission-operator">
            <h3>Operator area</h3>
            <p className="muted">
              {user.permissions.canAccessOperatorArea
                ? 'Available for this account.'
                : 'Not available for this account.'}
            </p>
            <Link className="inline-link" to="/operator">
              Open operator route
            </Link>
          </article>

          <article className="status-card" data-testid="permission-admin">
            <h3>Admin area</h3>
            <p className="muted">
              {user.permissions.canAccessAdminArea
                ? 'Available for this account.'
                : 'Only admin users can access it.'}
            </p>
            <Link className="inline-link" to="/admin">
              Open admin route
            </Link>
          </article>
        </div>
      </div>
    </section>
  );
}
