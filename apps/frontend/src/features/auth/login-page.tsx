import { LogIn, ShieldCheck, UserRound } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation, useNavigate } from 'react-router-dom';
import { ApiClientError } from '@/lib/api';
import { useAuth } from './auth-context';

const loginSchema = z.object({
  email: z.email('Digite um e-mail valido.'),
  password: z.string().min(8, 'A senha precisa ter pelo menos 8 caracteres.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LocationState {
  from?: {
    pathname?: string;
  };
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@testforge.local',
      password: 'TestForge@123',
    },
  });

  const locationState = location.state as LocationState | null;
  const redirectTo = locationState?.from?.pathname ?? '/';

  const onSubmit = form.handleSubmit(async (values) => {
    setServerError(null);

    try {
      await login(values);
      void navigate(redirectTo, { replace: true });
    } catch (error) {
      setServerError(
        error instanceof ApiClientError
          ? error.message
          : 'Nao foi possivel entrar agora. Tente novamente.',
      );
    }
  });

  return (
    <section className="auth-page" data-testid="login-page">
      <div className="panel auth-panel">
        <div className="auth-copy">
          <p className="eyebrow">Acesso seguro</p>
          <h2>Entre para testar areas protegidas, perfis e fluxos do sistema.</h2>
          <p className="muted">
            Use as contas de exemplo para validar permissoes, renovacao de sessao e navegacao por
            nivel de acesso sem precisar configurar nada extra.
          </p>
        </div>

        <div className="credential-list" data-testid="seeded-credentials">
          <div className="credential-card">
            <span className="credential-role">Conta administrativa: </span>
            <code>admin@testforge.local</code>
          </div>
          <div className="credential-card">
            <span className="credential-role">Conta operacional: </span>
            <code>operator@testforge.local</code>
          </div>
          <div className="credential-card">
            <span className="credential-role">Senha padrao: </span>
            <code>TestForge@123</code>
          </div>
        </div>

        <div className="metric-grid">
          <article className="metric-card">
            <ShieldCheck size={18} />
            <strong>Login guiado</strong>
            <p>Os campos ja vem preenchidos para acelerar seus cenarios de QA.</p>
          </article>
          <article className="metric-card">
            <UserRound size={18} />
            <strong>Perfis reais</strong>
            <p>Alterne entre administrador e operador para validar regras de acesso.</p>
          </article>
        </div>

        <form
          className="auth-form"
          onSubmit={(event) => {
            void onSubmit(event);
          }}
          data-testid="login-form"
        >
          <label className="field">
            <span>E-mail</span>
            <input
              {...form.register('email')}
              type="email"
              placeholder="voce@empresa.com.br"
              data-testid="login-email-input"
            />
            {form.formState.errors.email ? (
              <small className="field-error" data-testid="login-email-error">
                {form.formState.errors.email.message}
              </small>
            ) : null}
          </label>

          <label className="field">
            <span>Senha</span>
            <input
              {...form.register('password')}
              type="password"
              placeholder="Digite sua senha"
              data-testid="login-password-input"
            />
            {form.formState.errors.password ? (
              <small className="field-error" data-testid="login-password-error">
                {form.formState.errors.password.message}
              </small>
            ) : null}
          </label>

          {serverError ? (
            <div className="form-alert" role="alert" data-testid="login-error-alert">
              {serverError}
            </div>
          ) : null}

          <button
            className="primary-button"
            type="submit"
            disabled={form.formState.isSubmitting}
            data-testid="login-submit-button"
          >
            <LogIn size={16} />
            {form.formState.isSubmitting ? 'Entrando...' : ' Entrar na plataforma'}
          </button>
        </form>
      </div>
    </section>
  );
}
