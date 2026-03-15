import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/auth-context';

export function AppShell() {
  const { isAuthenticated, user } = useAuth();

  return (
    <main className="app-shell" data-testid="app-shell">
      <header className="hero">
        <div className="hero-topline">
          <p className="eyebrow">TestForge</p>
          <nav className="top-nav" data-testid="top-navigation">
            <Link to="/">Home</Link>
            {isAuthenticated ? <Link to="/operator">Operator</Link> : null}
            {user?.permissions.canAccessAdminArea ? <Link to="/admin">Admin</Link> : null}
            {!isAuthenticated ? <Link to="/login">Login</Link> : null}
          </nav>
        </div>
        <h1>Product management playground built for automation practice.</h1>
        <p className="lead">
          A clean full-stack foundation with room for E2E, API, component, accessibility and
          performance testing.
        </p>
      </header>

      <section className="content">
        <Outlet />
      </section>
    </main>
  );
}
