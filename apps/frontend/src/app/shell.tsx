import { Outlet } from 'react-router-dom';

export function AppShell() {
  return (
    <main className="app-shell">
      <header className="hero">
        <p className="eyebrow">TestForge</p>
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
