import { Link, Outlet } from 'react-router-dom';

export function MarketingLayout() {
  return (
    <div className="marketing-shell">
      <a className="skip-link" href="#conteudo-principal">
        Pular para o conteudo
      </a>

      <header className="marketing-header">
        <Link className="brand" to="/">
          <span className="brand-mark">TF</span>
          <span>
            <strong>TestForge</strong>
            <span>QA Lab</span>
          </span>
        </Link>
      </header>

      <main className="marketing-main" id="conteudo-principal">
        <Outlet />
      </main>
    </div>
  );
}
