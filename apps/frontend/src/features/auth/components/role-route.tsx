import { Navigate, Outlet } from 'react-router-dom';
import type { UserRole } from '@testforge/shared-types';
import { useAuth } from '@/features/auth/auth-context';
import { formatRoleLabel } from '@/lib/labels';

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
        <p className="eyebrow">Acesso negado</p>
        <h2>Seu perfil nao possui permissao para abrir esta area.</h2>
        <p className="muted">
          No momento voce esta logado como <strong>{formatRoleLabel(user.role)}</strong>. Entre com
          uma conta autorizada ou retorne ao painel principal.
        </p>
      </section>
    );
  }

  return <Outlet />;
}
