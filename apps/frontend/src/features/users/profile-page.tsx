import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { UpdateProfileRequest, UserProfile } from '@testforge/shared-types';
import { ErrorState, LoadingState } from '@/components/state-blocks';
import { useAuth } from '@/features/auth/auth-context';
import { useToast } from '@/features/ui/toast-context';
import { formatDateTime, formatRoleLabel, formatUserStatus } from '@/lib/labels';

export function ProfilePage() {
  const { fetchWithAuth } = useAuth();
  const { pushToast } = useToast();
  const [name, setName] = useState('');

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: () => fetchWithAuth<UserProfile>('/users/me'),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateProfileRequest) =>
      fetchWithAuth<UserProfile>('/users/me', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: (payload) => {
      setName(payload.name);
      pushToast({
        title: 'Perfil atualizado',
        description: 'Seus dados foram salvos com sucesso.',
      });
      void profileQuery.refetch();
    },
    onError: (error) => {
      pushToast({
        title: 'Nao foi possivel atualizar o perfil',
        description: error instanceof Error ? error.message : 'Tente novamente em instantes.',
        variant: 'error',
      });
    },
  });

  if (profileQuery.isLoading) {
    return (
      <LoadingState
        title="Carregando seu perfil"
        description="Buscando os dados mais recentes da sua conta."
        testId="profile-loading"
      />
    );
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <ErrorState
        title="Nao foi possivel carregar o perfil"
        description="Os dados da sua conta nao estao disponiveis no momento."
        testId="profile-error"
        action={
          <button
            type="button"
            className="primary-button"
            onClick={() => void profileQuery.refetch()}
          >
            Tentar novamente
          </button>
        }
      />
    );
  }

  const profile = profileQuery.data;
  const effectiveName = name || profile.name;

  return (
    <section className="dashboard-grid" data-testid="profile-page">
      <div className="panel section-header">
        <div>
          <p className="eyebrow">Meu perfil</p>
          <h2>Mantenha seus dados de acesso sempre atualizados</h2>
          <p className="muted">
            Esta tela ajuda a validar leitura autenticada, alteracao de perfil e feedback visual de
            sucesso ou erro.
          </p>
        </div>
      </div>

      <div className="panel detail-grid" data-testid="profile-summary">
        <div>
          <dt>E-mail</dt>
          <dd>{profile.email}</dd>
        </div>
        <div>
          <dt>Perfil</dt>
          <dd>{formatRoleLabel(profile.role)}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{formatUserStatus(profile.status)}</dd>
        </div>
        <div>
          <dt>Ultimo acesso</dt>
          <dd>{formatDateTime(profile.lastLoginAt)}</dd>
        </div>
      </div>

      <form
        className="panel form-grid"
        data-testid="profile-form"
        onSubmit={(event) => {
          event.preventDefault();
          updateMutation.mutate({ name: effectiveName });
        }}
      >
        <label className="field">
          Nome de exibicao
          <input
            value={effectiveName}
            onChange={(event) => setName(event.target.value)}
            data-testid="profile-name-input"
          />
        </label>
        <div className="action-row">
          <button
            type="submit"
            className="primary-button"
            disabled={updateMutation.isPending}
            data-testid="profile-save-button"
          >
            {updateMutation.isPending ? 'Salvando...' : 'Salvar alteracoes'}
          </button>
        </div>
      </form>
    </section>
  );
}
