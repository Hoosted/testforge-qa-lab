import {
  Activity,
  LayoutDashboard,
  Package2,
  ShieldCheck,
  Sparkles,
  Tags,
  Truck,
  UserCog,
  UserRound,
} from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/auth-context';
import { formatRoleLabel } from '@/lib/labels';

export function AppShell() {
  const { isAuthenticated, user } = useAuth();
  const navigationItems = [
    { to: '/', label: 'Painel', icon: LayoutDashboard, visible: isAuthenticated },
    { to: '/products', label: 'Produtos', icon: Package2, visible: isAuthenticated },
    { to: '/profile', label: 'Meu perfil', icon: UserRound, visible: isAuthenticated },
    {
      to: '/operator',
      label: 'Operacao',
      icon: Activity,
      visible: Boolean(user?.permissions.canAccessOperatorArea),
    },
    {
      to: '/admin',
      label: 'Administracao',
      icon: ShieldCheck,
      visible: Boolean(user?.permissions.canAccessAdminArea),
    },
    {
      to: '/admin/categories',
      label: 'Categorias',
      icon: Tags,
      visible: Boolean(user?.permissions.canManageCatalog),
    },
    {
      to: '/admin/suppliers',
      label: 'Fornecedores',
      icon: Truck,
      visible: Boolean(user?.permissions.canManageCatalog),
    },
    {
      to: '/admin/users',
      label: 'Usuarios',
      icon: UserCog,
      visible: Boolean(user?.permissions.canAccessAdminArea),
    },
  ].filter((item) => item.visible);

  const highlights = [
    {
      title: 'Experiencia clara',
      description: 'Textos mais humanos, navegacao direta e feedbacks pensados para o dia a dia.',
    },
    {
      title: 'Visual consistente',
      description: 'Cards, formularios e tabelas seguem o mesmo sistema visual em todas as areas.',
    },
    {
      title: 'Pronto para QA',
      description:
        'Fluxos protegidos, estados vazios e erros continuam previsiveis para automacao.',
    },
  ];

  return (
    <main className="app-shell" data-testid="app-shell">
      <div className="app-backdrop" />
      <div className="app-grid">
        <header className="hero panel">
          <div className="hero-topline">
            <div className="brand-lockup">
              <div className="brand-mark">
                <Sparkles size={20} />
              </div>
              <div>
                <p className="eyebrow">TestForge QA Lab</p>
                <strong className="brand-title">
                  Laboratorio nacional para explorar fluxos de produto
                </strong>
              </div>
            </div>

            <div className="hero-badges">
              <span className="status-chip">
                {isAuthenticated
                  ? `Sessao ativa: ${formatRoleLabel(user?.role)}`
                  : 'Ambiente pronto'}
              </span>
              <NavLink className="secondary-nav-link" to={isAuthenticated ? '/profile' : '/login'}>
                {isAuthenticated ? 'Ver meu perfil' : 'Acessar plataforma'}
              </NavLink>
            </div>
          </div>

          <div className="hero-body">
            <div className="hero-copy">
              <h1>Uma interface bonita, clean e moderna para o seu laboratorio de QA.</h1>
              <p className="lead">
                O projeto agora apresenta um visual mais maduro, com leitura confortavel, icones,
                tipografia atual e uma navegacao muito mais intuitiva para equipes brasileiras.
              </p>
            </div>

            <div className="hero-summary">
              {highlights.map((item) => (
                <article key={item.title} className="hero-summary-card">
                  <strong>{item.title}</strong>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </div>

          <nav className="top-nav" data-testid="top-navigation">
            {navigationItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => (isActive ? 'nav-link nav-link-active' : 'nav-link')}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}

            {!isAuthenticated ? (
              <NavLink
                to="/login"
                className={({ isActive }) => (isActive ? 'nav-link nav-link-active' : 'nav-link')}
              >
                <ShieldCheck size={16} />
                <span>Entrar</span>
              </NavLink>
            ) : null}
          </nav>
        </header>

        <section className="content">
          <Outlet />
        </section>
      </div>
    </main>
  );
}
