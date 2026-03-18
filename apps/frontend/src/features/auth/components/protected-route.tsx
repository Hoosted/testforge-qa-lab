import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/auth-context';

export function ProtectedRoute() {
  const { isAuthenticated, isBootstrapping } = useAuth();
  const location = useLocation();

  if (isBootstrapping) {
    return (
      <div className="panel auth-state" data-testid="auth-loading-state">
        <p className="eyebrow">Restaurando sessao</p>
        <h2>Estamos confirmando seu acesso...</h2>
        <p className="muted">Aguarde um instante enquanto a plataforma valida sua autenticacao.</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
