import { NavLink, Outlet, Link } from 'react-router-dom';
import { useAuth } from '@/features/auth/auth-context';
import { cn } from '@/lib/cn';

const navigationItems = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/labs', label: 'Labs' },
  { to: '/labs/api', label: 'API' },
  { to: '/labs/acessibilidade', label: 'A11y' },
];

export function SiteLayout() {
  const { session, logout } = useAuth();

  return (
    <div className="site-shell">
      <header className="site-header">
        <Link className="brand" to="/">
          <span className="brand-mark">TF</span>
          <span>
            <strong>TestForge</strong>
            <span>QA Lab</span>
          </span>
        </Link>

        <nav className="site-nav" aria-label="Principal">
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

      <main>
        <Outlet />
      </main>
    </div>
  );
}
