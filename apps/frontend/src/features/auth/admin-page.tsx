import { useQuery } from '@tanstack/react-query';
import type { AuthMessageResponse } from '@testforge/shared-types';
import { Link } from 'react-router-dom';
import { useAuth } from './auth-context';

export function AdminPage() {
  const { fetchWithAuth } = useAuth();
  const adminQuery = useQuery({
    queryKey: ['admin-access'],
    queryFn: () => fetchWithAuth<AuthMessageResponse>('/auth/admin/access'),
  });

  return (
    <section className="panel protected-panel" data-testid="admin-page">
      <p className="eyebrow">Central administrativa</p>
      <h2>Governanca, cadastros e historico em um unico painel</h2>
      <p className="muted">
        Esta visao comprova o acesso administrativo e organiza os atalhos para as areas restritas da
        plataforma.
      </p>
      {adminQuery.isLoading ? <p className="muted">Validando acesso de administrador...</p> : null}
      {adminQuery.isError ? (
        <p className="form-alert" data-testid="admin-error">
          Nao foi possivel validar o acesso administrativo agora.
        </p>
      ) : null}
      {adminQuery.data ? (
        <p className="status-chip" data-testid="admin-success">
          {adminQuery.data.message}
        </p>
      ) : null}
      <div className="action-row">
        <Link className="ghost-button button-link" to="/admin/categories">
          Gerenciar categorias
        </Link>
        <Link className="ghost-button button-link" to="/admin/suppliers">
          Gerenciar fornecedores
        </Link>
        <Link className="ghost-button button-link" to="/admin/users">
          Gerenciar usuarios
        </Link>
        <Link className="ghost-button button-link" to="/admin/audit">
          Ver auditoria
        </Link>
      </div>
    </section>
  );
}
