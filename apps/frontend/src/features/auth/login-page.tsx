import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation, useNavigate } from 'react-router-dom';
import { ApiClientError } from '@/lib/api';
import { useAuth } from './auth-context';

const loginSchema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(8, 'Password must have at least 8 characters'),
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
        error instanceof ApiClientError ? error.message : 'Login failed. Please try again.',
      );
    }
  });

  return (
    <section className="auth-page" data-testid="login-page">
      <div className="panel auth-panel">
        <div className="auth-copy">
          <p className="eyebrow">Authentication</p>
          <h2>Sign in to access protected product operations.</h2>
          <p className="muted">
            Use one of the seeded accounts to validate roles, session renewal and protected routing
            flows.
          </p>
        </div>

        <div className="credential-list" data-testid="seeded-credentials">
          <div className="credential-card">
            <span className="credential-role">Admin</span>
            <code>admin@testforge.local</code>
          </div>
          <div className="credential-card">
            <span className="credential-role">Operator</span>
            <code>operator@testforge.local</code>
          </div>
          <div className="credential-card">
            <span className="credential-role">Password</span>
            <code>TestForge@123</code>
          </div>
        </div>

        <form
          className="auth-form"
          onSubmit={(event) => {
            void onSubmit(event);
          }}
          data-testid="login-form"
        >
          <label className="field">
            <span>Email</span>
            <input
              {...form.register('email')}
              type="email"
              placeholder="you@example.com"
              data-testid="login-email-input"
            />
            {form.formState.errors.email ? (
              <small className="field-error" data-testid="login-email-error">
                {form.formState.errors.email.message}
              </small>
            ) : null}
          </label>

          <label className="field">
            <span>Password</span>
            <input
              {...form.register('password')}
              type="password"
              placeholder="Enter your password"
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
            {form.formState.isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </section>
  );
}
