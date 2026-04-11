import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { A11yLabPage } from '@/features/a11y-lab/a11y-lab-page';

describe('A11yLabPage', () => {
  it('shows accessible validation feedback for the simulated profile form', async () => {
    render(<A11yLabPage />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /enviar cadastro simulado/i }));

    expect(
      screen.getByText(/campos que precisam de revisao antes do envio do cadastro simulado/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/informe um nome completo com pelo menos 3 caracteres/i)).toBeInTheDocument();
    expect(screen.getByText(/informe um email valido para contato/i)).toBeInTheDocument();
    expect(screen.getByText(/marque o consentimento para testar checkbox obrigatorio/i)).toBeInTheDocument();
  });

  it('submits the simulated profile form and updates the live region', async () => {
    render(<A11yLabPage />);
    const user = userEvent.setup();

    const nameInput = screen.getByLabelText(/nome completo/i);
    const emailInput = screen.getByRole('textbox', {
      name: /email esse campo ajuda a testar validacao com teclado/i,
    });
    const phoneInput = screen.getByRole('textbox', {
      name: /telefone experimente formatos diferentes/i,
    });
    const roleInput = screen.getByRole('textbox', {
      name: /cargo atual ou objetivo profissional exemplo/i,
    });
    const notesInput = screen.getByRole('textbox', {
      name: /observacoes para a equipe de onboardingdescreva contexto/i,
    });
    const birthDateInput = screen.getByLabelText(/data de nascimento/i);
    const consentCheckbox = screen.getByRole('checkbox', {
      name: /consentimento para cadastro simulado/i,
    });

    await user.type(nameInput, 'Marina QA Silva');
    await user.type(emailInput, 'marina@testforge.dev');
    await user.type(phoneInput, '65999998888');
    await user.type(roleInput, 'QA em transicao para automacao');
    await user.type(notesInput, 'Preciso de alto contraste e navegação consistente por teclado.');
    fireEvent.change(birthDateInput, {
      target: { value: '1995-08-20' },
    });
    await user.click(consentCheckbox);

    expect(nameInput).toHaveValue('Marina QA Silva');
    expect(emailInput).toHaveValue('marina@testforge.dev');
    expect(phoneInput).toHaveValue('65999998888');
    expect(roleInput).toHaveValue('QA em transicao para automacao');
    expect(notesInput).toHaveValue('Preciso de alto contraste e navegação consistente por teclado.');
    expect(birthDateInput).toHaveValue('1995-08-20');
    expect(consentCheckbox).toBeChecked();

    await user.click(screen.getByRole('button', { name: /enviar cadastro simulado/i }));

    expect(screen.getByText(/cadastro validado com sucesso/i)).toBeInTheDocument();
    expect(
      screen.getByText(/cadastro simulado enviado para Marina QA Silva/i),
    ).toBeInTheDocument();
  });
});
