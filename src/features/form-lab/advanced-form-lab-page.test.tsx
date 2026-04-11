import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { AuthProvider } from '@/features/auth/auth-context';
import { AdvancedFormLabPage } from '@/features/form-lab/advanced-form-lab-page';

const validateSlugMock = vi.fn();
const submitAdvancedFormMock = vi.fn();

vi.mock('@/features/form-lab/api', () => ({
  validateSlug: (...args: unknown[]) => validateSlugMock(...args),
  submitAdvancedForm: (...args: unknown[]) => submitAdvancedFormMock(...args),
}));

vi.mock('@/lib/use-debounced-value', () => ({
  useDebouncedValue: <T,>(value: T) => value,
}));

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AdvancedFormLabPage />
        </AuthProvider>
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('AdvancedFormLabPage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    validateSlugMock.mockResolvedValue({ available: true });
    submitAdvancedFormMock.mockResolvedValue({
      id: 'submission_001',
      ownerTeam: 'Checkout',
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('keeps boolean controls keyboard accessible on the risk step', async () => {
    renderPage();
    const user = userEvent.setup();

    await user.click(screen.getByRole('tab', { name: /risco/i }));

    const approvalToggle = screen.getByRole('checkbox', { name: /requer aprovacao manual/i });
    expect(approvalToggle).toBeChecked();

    approvalToggle.focus();
    await user.keyboard('[Space]');

    expect(approvalToggle).not.toBeChecked();
    expect(screen.queryByLabelText(/email do aprovador/i)).not.toBeInTheDocument();

    const accessibilityToggle = screen.getByRole('checkbox', {
      name: /revisao de acessibilidade concluida/i,
    });
    expect(accessibilityToggle).toBeInTheDocument();
  });

  it('preserves step navigation with conditional fields', async () => {
    renderPage();
    const user = userEvent.setup();

    await user.click(screen.getByRole('tab', { name: /entrega/i }));
    expect(screen.getByLabelText(/data planejada/i)).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/modo de lancamento/i), 'immediate');
    expect(screen.queryByLabelText(/data planejada/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: /risco/i }));
    await user.click(screen.getByRole('checkbox', { name: /requer aprovacao manual/i }));
    expect(screen.queryByLabelText(/email do aprovador/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: /entrega/i }));
    expect(screen.getByLabelText(/modo de lancamento/i)).toHaveValue('immediate');

    await user.click(screen.getByRole('tab', { name: /risco/i }));
    expect(screen.queryByLabelText(/email do aprovador/i)).not.toBeInTheDocument();
  });

  it('shows contextual hints and validation messages on the current step', async () => {
    renderPage();
    const user = userEvent.setup();

    await user.click(screen.getByRole('tab', { name: /risco/i }));
    await user.selectOptions(screen.getByLabelText(/nivel de risco/i), 'high');

    expect(
      screen.getByText(/risco alto exige estrategia de monitoramento detalhada/i),
    ).toBeInTheDocument();

    const approverEmail = screen.getByLabelText(/email do aprovador/i);
    await user.clear(approverEmail);
    await user.tab();

    expect(screen.getByText(/informe um email valido para aprovacao/i)).toBeInTheDocument();
  });
});
