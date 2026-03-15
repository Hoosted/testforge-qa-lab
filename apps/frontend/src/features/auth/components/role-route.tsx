import { Navigate, Outlet } from 'react-router-dom';
import type { UserRole } from '@testforge/shared-types';
import { useAuth } from '@/features/auth/auth-context';

interface RoleRouteProps {
  allow: UserRole[];
}

export function RoleRoute({ allow }: RoleRouteProps) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allow.includes(user.role)) {
    return (
      <section className="panel auth-state" data-testid="access-denied-state">
        <p className="eyebrow">Access denied</p>
        <h2>You do not have permission to open this area.</h2>
        <p className="muted">
          Your current role is <strong>{user.role}</strong>. Use an account with the required
          permissions or return to the dashboard.
        </p>
      </section>
    );
  }

  return <Outlet />;
}
