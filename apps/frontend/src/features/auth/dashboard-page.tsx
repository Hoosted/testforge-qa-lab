import { CircleGauge, LockKeyhole, PackageSearch, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from './auth-context';
import { formatRoleLabel } from '@/lib/labels';

export function DashboardPage() {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <section className="dashboard-grid" data-testid="dashboard-page">
      <div className="panel account-panel">
        <p className="eyebrow">Visao geral da sessao</p>
        <h2 data-testid="current-user-name">{user.name}</h2>
        <div className="account-meta">
          <span className="status-chip" data-testid="current-user-role">
            {formatRoleLabel(user.role)}
          </span>
          <span className="muted" data-testid="current-user-email">
            {user.email}
          </span>
        </div>
        <p className="muted">
          Este painel confirma que sua sessao protegida esta ativa e pronta para validar fluxos com
          refresh token, permissao e navegacao restrita.
        </p>
        <div className="action-row">
          <Link className="primary-button button-link" to="/products">
            Ir para produtos
          </Link>
          <button
            className="ghost-button"
            onClick={() => void logout()}
            data-testid="logout-button"
          >
            Sair
          </button>
        </div>
      </div>

      <div className="metric-grid">
        <article className="metric-card">
          <ShieldCheck size={18} />
          <strong>
            {user.permissions.canAccessAdminArea ? 'Admin liberado' : 'Admin restrito'}
          </strong>
          <p>
            {user.permissions.canAccessAdminArea
              ? 'Sua conta pode acessar configuracoes, usuarios e auditoria.'
              : 'Esta conta nao possui acesso a rotas administrativas.'}
          </p>
        </article>

        <article className="metric-card">
          <PackageSearch size={18} />
          <strong>
            {user.permissions.canManageProducts ? 'Produtos editaveis' : 'Modo consulta'}
          </strong>
          <p>
            {user.permissions.canManageProducts
              ? 'Cadastros, edicoes e exclusoes de produtos estao disponiveis.'
              : 'Voce pode navegar pelos produtos sem alterar os registros.'}
          </p>
        </article>

        <article className="metric-card">
          <CircleGauge size={18} />
          <strong>
            {user.permissions.canAccessOperatorArea
              ? 'Operacao disponivel'
              : 'Operacao indisponivel'}
          </strong>
          <p>Use esta area para validar acessos intermediarios e comportamentos por perfil.</p>
        </article>
      </div>

      <div className="panel">
        <p className="eyebrow">Atalhos do ambiente</p>
        <div className="status-grid">
          <article className="status-card" data-testid="permission-products">
            <h3>Workspace de produtos</h3>
            <p className="muted">
              Explore filtros, busca com debounce, paginacao, estados de erro e acoes sensiveis ao
              perfil.
            </p>
            <Link className="inline-link" to="/products">
              Abrir catalogo
            </Link>
          </article>

          <article className="status-card" data-testid="permission-operator">
            <h3>Area operacional</h3>
            <p className="muted">
              {user.permissions.canAccessOperatorArea
                ? 'Disponivel para esta conta.'
                : 'Esta conta nao possui acesso a operacao.'}
            </p>
            <Link className="inline-link" to="/operator">
              Ver area operacional
            </Link>
          </article>

          <article className="status-card" data-testid="permission-admin">
            <h3>Painel administrativo</h3>
            <p className="muted">
              {user.permissions.canAccessAdminArea
                ? 'Acesso liberado para governanca do sistema.'
                : 'Somente administradores podem entrar aqui.'}
            </p>
            <Link className="inline-link" to="/admin">
              Abrir administracao
            </Link>
          </article>

          <article className="status-card">
            <h3>Seguranca da sessao</h3>
            <p className="muted">
              Recarregue a pagina a qualquer momento para validar a restauracao automatica da
              autenticacao.
            </p>
            <span className="page-note">
              <LockKeyhole size={16} />
              Sessao persistente habilitada
            </span>
          </article>
        </div>
      </div>
    </section>
  );
}
