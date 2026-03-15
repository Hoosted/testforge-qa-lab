import { healthcheck } from '@testforge/shared-types';

export function HealthPage() {
  return (
    <div className="panel">
      <div className="status-grid">
        <article className="status-card">
          <h2>Frontend</h2>
          <span className="status-chip">Ready</span>
          <p className="muted">Vite, React Router and TanStack Query are wired into the shell.</p>
        </article>

        <article className="status-card">
          <h2>Backend</h2>
          <span className="status-chip">{healthcheck.status}</span>
          <p className="muted">
            The initial NestJS API exposes a health endpoint under <code>/api/v1/health</code>.
          </p>
        </article>

        <article className="status-card">
          <h2>Monorepo</h2>
          <span className="status-chip">Bootstrapped</span>
          <p className="muted">
            Shared types, configs, docs and test examples are ready for the next iteration.
          </p>
        </article>
      </div>
    </div>
  );
}
