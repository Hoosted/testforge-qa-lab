import { Link } from 'react-router-dom';
import { seedCredentials } from '@/data/playground';
import { useAuth } from '@/features/auth/auth-context';

export function AuthLabPage() {
  const { session, expireSession, logout } = useAuth();

  return (
    <section className="page-shell">
      <div className="page-intro">
        <p className="eyebrow">Auth Lab</p>
        <h1>Sessao, role e expiracao em um sandbox pequeno o bastante para entender rapido.</h1>
        <p className="lede">
          Este lab existe para voce alternar entre seeds publicas e validar guardas de leitura,
          escrita e expiracao sem depender de servico externo.
        </p>
      </div>

      <div className="split-layout">
        <section className="panel">
          <h2>Credenciais seedadas</h2>
          <ul className="seed-list">
            {seedCredentials.map((seed) => (
              <li key={seed.email}>
                <strong>{seed.role}</strong>
                <span>{seed.email}</span>
                <code>{seed.password}</code>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel panel-strong">
          <h2>Estado atual da sessao</h2>
          {session ? (
            <div className="status-stack">
              <p>
                <strong>{session.name}</strong>
              </p>
              <p>{session.email}</p>
              <p>Papel ativo: {session.role}</p>
              <div className="action-row">
                <button className="secondary-button" onClick={expireSession} type="button">
                  Limpar sessao
                </button>
                <button className="secondary-button" onClick={logout} type="button">
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="status-stack">
              <p>Nenhuma sessao ativa no momento.</p>
              <Link className="primary-link" to="/entrar">
                Entrar com uma seed
              </Link>
            </div>
          )}
        </section>
      </div>

      <section className="panel panel-subtle info-grid">
        <article>
          <p className="eyebrow">Admin</p>
          <h3>Pode enfileirar a submissao do wizard</h3>
          <p>
            Use esta seed para validar o fluxo feliz, persistencia local de sessao e respostas 201.
          </p>
        </article>
        <article>
          <p className="eyebrow">Operator</p>
          <h3>Ideal para exercitar o 403</h3>
          <p>
            O formulario continua visivel, mas o submit devolve permissao negada. Isso deixa a
            diferenca entre autenticacao e autorizacao bem observavel.
          </p>
        </article>
      </section>
    </section>
  );
}
