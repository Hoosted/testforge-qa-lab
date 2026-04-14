import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/auth-context';
import { cn } from '@/lib/cn';

const navigationItems = [
  { to: '/labs', label: 'Catalogo', end: true },
  { to: '/labs/auth', label: 'Auth' },
  { to: '/labs/api', label: 'API' },
  { to: '/labs/acessibilidade', label: 'A11y' },
];

export function LabLayout() {
  const { session, logout } = useAuth();

  return (
    <div className="lab-shell">
      <a className="skip-link" href="#conteudo-principal">
        Pular para o conteudo
      </a>

      <header className="lab-header">
        <Link className="brand" to="/labs">
          <span className="brand-mark">TF</span>
          <span>
            <strong>TestForge</strong>
            <span>Lab area</span>
          </span>
        </Link>

        <nav className="site-nav" aria-label="Laboratorios">
          {navigationItems.map((item) => (
            <NavLink
              key={item.to}
              className={({ isActive }) => cn('nav-link', isActive && 'nav-link-active')}
              end={item.end}
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="session-panel">
          <Link className="home-return-link" to="/">
            Voltar ao inicio
          </Link>

          {session ? (
            <>
              <div className="session-badge" aria-live="polite">
                <strong>{session.role}</strong>
                <span>{session.email}</span>
              </div>
              <button className="secondary-button" onClick={logout} type="button">
                Sair
              </button>
            </>
          ) : (
            <Link className="primary-link" to="/entrar">
              Entrar no sandbox
            </Link>
          )}
        </div>
      </header>

      <main className="lab-main" id="conteudo-principal">
        <Outlet />
      </main>
    </div>
  );
}
