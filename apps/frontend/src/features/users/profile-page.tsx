import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { UpdateProfileRequest, UserProfile } from '@testforge/shared-types';
import { ErrorState, LoadingState } from '@/components/state-blocks';
import { useAuth } from '@/features/auth/auth-context';
import { useToast } from '@/features/ui/toast-context';

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
        title: 'Profile updated',
        description: 'Your personal details were saved successfully.',
      });
      void profileQuery.refetch();
    },
    onError: (error) => {
      pushToast({
        title: 'Unable to update profile',
        description: error instanceof Error ? error.message : 'Try again in a moment.',
        variant: 'error',
      });
    },
  });

  if (profileQuery.isLoading) {
    return (
      <LoadingState
        title="Loading your profile"
        description="Fetching the latest session profile details."
        testId="profile-loading"
      />
    );
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <ErrorState
        title="Unable to load profile"
        description="Your account details are not available right now."
        testId="profile-error"
        action={
          <button
            type="button"
            className="primary-button"
            onClick={() => void profileQuery.refetch()}
          >
            Retry
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
          <p className="eyebrow">Profile</p>
          <h2>Keep your account details current</h2>
          <p className="muted">
            This screen supports authenticated profile assertions and updates.
          </p>
        </div>
      </div>

      <div className="panel detail-grid" data-testid="profile-summary">
        <div>
          <dt>Email</dt>
          <dd>{profile.email}</dd>
        </div>
        <div>
          <dt>Role</dt>
          <dd>{profile.role}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{profile.status}</dd>
        </div>
        <div>
          <dt>Last login</dt>
          <dd>{profile.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleString() : 'Never'}</dd>
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
          Display name
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
            {updateMutation.isPending ? 'Saving...' : 'Save profile'}
          </button>
        </div>
      </form>
    </section>
  );
}
