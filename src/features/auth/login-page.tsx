import { FormEvent, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { seedCredentials } from '@/data/playground';
import { useAuth } from '@/features/auth/auth-context';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, lastError, clearError } = useAuth();
  const [email, setEmail] = useState<string>(seedCredentials[0].email);
  const [password, setPassword] = useState<string>(seedCredentials[0].password);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const next = new URLSearchParams(location.search).get('next') ?? '/labs/formulario-avancado';
      void navigate(next, { replace: true });
    }
  }, [isAuthenticated, location.search, navigate]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    await login({ email, password });
    setIsSubmitting(false);
  };

  return (
    <section className="auth-shell">
      <div className="page-intro">
        <p className="eyebrow">Sandbox access</p>
        <h1>Entre com uma seed publica para abrir os labs protegidos.</h1>
        <p className="lede">
          A v1 nao depende de provedor externo. O objetivo aqui e praticar fluxos de sessao e role
          guard sem ruido operacional.
        </p>
      </div>

      <div className="auth-grid">
        <form className="editorial-panel auth-form" onSubmit={handleSubmit}>
          <label className="field">
            Email
            <input
              autoComplete="username"
              name="email"
              onChange={(event) => {
                clearError();
                setEmail(event.target.value);
              }}
              value={email}
            />
          </label>

          <label className="field">
            Senha
            <input
              autoComplete="current-password"
              name="password"
              onChange={(event) => {
                clearError();
                setPassword(event.target.value);
              }}
              type="password"
              value={password}
            />
          </label>

          {lastError ? (
            <div className="inline-alert" role="alert">
              {lastError}
            </div>
          ) : null}

          <button className="primary-button" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Entrando...' : 'Entrar no sandbox'}
          </button>
        </form>

        <aside className="editorial-panel credential-panel">
          <p className="eyebrow">Seeds oficiais</p>
          <ul className="seed-list">
            {seedCredentials.map((seed) => (
              <li key={seed.email}>
                <strong>{seed.label}</strong>
                <span>{seed.email}</span>
                <code>{seed.password}</code>
              </li>
            ))}
          </ul>

          <p className="support-copy">
            O papel `ADMIN` pode enviar o wizard. O `OPERATOR` e ideal para testar guardas de
            permissao e mensagens 403.
          </p>

          <Link className="text-link" to="/labs/auth">
            Ver o Auth Lab
          </Link>
        </aside>
      </div>
    </section>
  );
}
