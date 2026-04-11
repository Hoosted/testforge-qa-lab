import { useId, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';

type PreferredContact = 'email' | 'whatsapp' | 'phone';

interface AccessibilityProfileFormValues {
  fullName: string;
  socialName: string;
  email: string;
  phone: string;
  birthDate: string;
  role: string;
  preferredContact: PreferredContact;
  workMode: 'remote' | 'hybrid' | 'onsite';
  accessibilityNeeds: string[];
  notes: string;
  consent: boolean;
}

type AccessibilityProfileErrors = Partial<Record<keyof AccessibilityProfileFormValues, string>>;

const accessibilityNeedOptions = [
  'Leitor de tela',
  'Alto contraste',
  'Legenda em video',
  'Navegacao por teclado',
] as const;

const defaultValues: AccessibilityProfileFormValues = {
  fullName: '',
  socialName: '',
  email: '',
  phone: '',
  birthDate: '',
  role: '',
  preferredContact: 'email',
  workMode: 'hybrid',
  accessibilityNeeds: ['Navegacao por teclado'],
  notes: '',
  consent: false,
};

function validateForm(values: AccessibilityProfileFormValues) {
  const errors: AccessibilityProfileErrors = {};

  if (values.fullName.trim().length < 3) {
    errors.fullName = 'Informe um nome completo com pelo menos 3 caracteres.';
  }

  if (!/^\S+@\S+\.\S+$/.test(values.email)) {
    errors.email = 'Informe um email valido para contato.';
  }

  const digits = values.phone.replace(/\D/g, '');
  if (digits.length < 10) {
    errors.phone = 'Use um telefone com DDD para praticar validacao de formato.';
  }

  if (!values.birthDate) {
    errors.birthDate = 'Selecione a data de nascimento para concluir o cadastro simulado.';
  }

  if (values.role.trim().length < 2) {
    errors.role = 'Descreva o cargo atual ou objetivo profissional.';
  }

  if (values.accessibilityNeeds.length === 0) {
    errors.accessibilityNeeds = 'Selecione ao menos uma preferencia de acessibilidade.';
  }

  if (values.notes.trim().length < 16) {
    errors.notes = 'Use as observacoes para registrar contexto suficiente para avaliacao manual.';
  }

  if (!values.consent) {
    errors.consent = 'Marque o consentimento para testar checkbox obrigatorio com feedback associado.';
  }

  return errors;
}

export function A11yLabPage() {
  const baseId = useId();
  const [announcement, setAnnouncement] = useState('Nenhuma acao executada ainda.');
  const [values, setValues] = useState<AccessibilityProfileFormValues>(defaultValues);
  const [errors, setErrors] = useState<AccessibilityProfileErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const inputId = `${baseId}-full-name`;
  const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors]);

  function updateField<Key extends keyof AccessibilityProfileFormValues>(
    key: Key,
    value: AccessibilityProfileFormValues[Key],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) {
        return current;
      }

      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function handleNeedsChange(event: ChangeEvent<HTMLInputElement>) {
    const { value, checked } = event.target;

    setValues((current) => ({
      ...current,
      accessibilityNeeds: checked
        ? [...current.accessibilityNeeds, value]
        : current.accessibilityNeeds.filter((item) => item !== value),
    }));

    setErrors((current) => {
      if (!current.accessibilityNeeds) {
        return current;
      }

      const next = { ...current };
      delete next.accessibilityNeeds;
      return next;
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateForm(values);
    setErrors(nextErrors);
    setIsSubmitted(Object.keys(nextErrors).length === 0);

    if (Object.keys(nextErrors).length > 0) {
      setAnnouncement('Formulario com erros. Revise os campos destacados e tente novamente.');
      return;
    }

    setAnnouncement(
      `Cadastro simulado enviado para ${values.fullName}. O canal preferido registrado foi ${values.preferredContact}.`,
    );
  }

  function handleResetExample() {
    setValues(defaultValues);
    setErrors({});
    setIsSubmitted(false);
    setAnnouncement('Formulario restaurado para o exemplo inicial.');
  }

  function describedBy(field: keyof AccessibilityProfileFormValues, hintId: string, errorId: string) {
    return errors[field] ? `${hintId} ${errorId}` : hintId;
  }

  return (
    <section className="page-shell">
      <a className="skip-link" href={`#${inputId}`}>
        Pular para o formulario de cadastro
      </a>

      <div className="page-intro">
        <p className="eyebrow">Accessibility Lab</p>
        <h1>Landmarks, grupos semanticos, erros associados e feedback dinamico em um cadastro maior.</h1>
        <p className="lede">
          Este formulario simula um cadastro pessoal com validacoes, hints, fieldsets e live region
          para voce praticar inspeção manual e automacao acessivel na mesma tela.
        </p>
      </div>

      <div className="split-layout">
        <section className="panel">
          <h2>Checklist rapido</h2>
          <ul className="plain-list">
            <li>Verifique a ordem de tabulacao entre campos, radios, checkboxes e botoes.</li>
            <li>Inspecione foco visivel, `aria-invalid`, `aria-describedby` e agrupamentos por `fieldset`.</li>
            <li>Confirme se erros aparecem perto do campo e tambem no alerta geral do formulario.</li>
            <li>Observe o live region antes e depois do submit, com sucesso e com falha.</li>
          </ul>
        </section>

        <section className="panel panel-strong">
          <h2>Live region</h2>
          <p aria-live="polite" className="status-note">
            {announcement}
          </p>
          <button
            className="primary-button"
            onClick={() => setAnnouncement('Feedback dinamico atualizado com sucesso.')}
            type="button"
          >
            Atualizar feedback
          </button>
        </section>
      </div>

      <section className="panel panel-strong">
        <div className="split-layout split-layout-compact">
          <div className="note-grid">
            <p className="eyebrow">Cadastro pessoal simulado</p>
            <h2 id={inputId}>Zona de formulario acessivel</h2>
            <p className="support-copy">
              A proposta e simular um onboarding interno com dados pessoais, preferencias de contato
              e necessidades de acessibilidade declaradas.
            </p>
          </div>

          <div className="note-grid">
            <strong>O que observar</strong>
            <ul className="plain-list compact-list">
              <li>Labels e hints devem estar sempre ligados aos campos.</li>
              <li>Grupos de escolha precisam de `legend` clara.</li>
              <li>Checkbox obrigatorio deve produzir erro navegavel por leitor de tela.</li>
            </ul>
          </div>
        </div>

        {hasErrors ? (
          <div className="inline-alert" role="alert">
            Encontramos campos que precisam de revisao antes do envio do cadastro simulado.
          </div>
        ) : null}

        {isSubmitted ? (
          <div className="inline-success" role="status">
            Cadastro validado com sucesso. Use o formulario para testar estados de erro e sucesso.
          </div>
        ) : null}

        <form className="form-stack" noValidate onSubmit={handleSubmit}>
          <section className="panel panel-subtle">
            <p className="eyebrow">Identificacao</p>
            <div className="field-grid">
              <label className="field field-full" htmlFor={`${baseId}-name`}>
                Nome completo
                <input
                  aria-describedby={describedBy(
                    'fullName',
                    `${baseId}-name-hint`,
                    `${baseId}-name-error`,
                  )}
                  aria-invalid={Boolean(errors.fullName)}
                  className="field-control"
                  id={`${baseId}-name`}
                  name="fullName"
                  onChange={(event) => updateField('fullName', event.target.value)}
                  type="text"
                  value={values.fullName}
                />
                <span className="field-hint" id={`${baseId}-name-hint`}>
                  Use um nome completo para praticar leitura por label e anuncio de erro.
                </span>
                {errors.fullName ? (
                  <span className="field-error" id={`${baseId}-name-error`}>
                    {errors.fullName}
                  </span>
                ) : null}
              </label>

              <label className="field" htmlFor={`${baseId}-social-name`}>
                Nome social
                <input
                  aria-describedby={`${baseId}-social-name-hint`}
                  className="field-control"
                  id={`${baseId}-social-name`}
                  name="socialName"
                  onChange={(event) => updateField('socialName', event.target.value)}
                  type="text"
                  value={values.socialName}
                />
                <span className="field-hint" id={`${baseId}-social-name-hint`}>
                  Campo opcional para praticar preenchimento sem validacao obrigatoria.
                </span>
              </label>

              <label className="field" htmlFor={`${baseId}-birth-date`}>
                Data de nascimento
                <input
                  aria-describedby={describedBy(
                    'birthDate',
                    `${baseId}-birth-date-hint`,
                    `${baseId}-birth-date-error`,
                  )}
                  aria-invalid={Boolean(errors.birthDate)}
                  className="field-control"
                  id={`${baseId}-birth-date`}
                  name="birthDate"
                  onChange={(event) => updateField('birthDate', event.target.value)}
                  type="date"
                  value={values.birthDate}
                />
                <span className="field-hint" id={`${baseId}-birth-date-hint`}>
                  Campo util para validar foco, formato e mensagem contextual.
                </span>
                {errors.birthDate ? (
                  <span className="field-error" id={`${baseId}-birth-date-error`}>
                    {errors.birthDate}
                  </span>
                ) : null}
              </label>
            </div>
          </section>

          <section className="panel panel-subtle">
            <p className="eyebrow">Contato profissional</p>
            <div className="field-grid">
              <label className="field" htmlFor={`${baseId}-email`}>
                Email
                <input
                  aria-describedby={describedBy(
                    'email',
                    `${baseId}-email-hint`,
                    `${baseId}-email-error`,
                  )}
                  aria-invalid={Boolean(errors.email)}
                  className="field-control"
                  id={`${baseId}-email`}
                  name="email"
                  onChange={(event) => updateField('email', event.target.value)}
                  type="email"
                  value={values.email}
                />
                <span className="field-hint" id={`${baseId}-email-hint`}>
                  Esse campo ajuda a testar validacao com teclado e feedback ligado ao input.
                </span>
                {errors.email ? (
                  <span className="field-error" id={`${baseId}-email-error`}>
                    {errors.email}
                  </span>
                ) : null}
              </label>

              <label className="field" htmlFor={`${baseId}-phone`}>
                Telefone
                <input
                  aria-describedby={describedBy(
                    'phone',
                    `${baseId}-phone-hint`,
                    `${baseId}-phone-error`,
                  )}
                  aria-invalid={Boolean(errors.phone)}
                  className="field-control"
                  id={`${baseId}-phone`}
                  name="phone"
                  onChange={(event) => updateField('phone', event.target.value)}
                  type="tel"
                  value={values.phone}
                />
                <span className="field-hint" id={`${baseId}-phone-hint`}>
                  Experimente formatos diferentes para observar como o erro e anunciado.
                </span>
                {errors.phone ? (
                  <span className="field-error" id={`${baseId}-phone-error`}>
                    {errors.phone}
                  </span>
                ) : null}
              </label>

              <label className="field field-full" htmlFor={`${baseId}-role`}>
                Cargo atual ou objetivo profissional
                <input
                  aria-describedby={describedBy(
                    'role',
                    `${baseId}-role-hint`,
                    `${baseId}-role-error`,
                  )}
                  aria-invalid={Boolean(errors.role)}
                  className="field-control"
                  id={`${baseId}-role`}
                  name="role"
                  onChange={(event) => updateField('role', event.target.value)}
                  type="text"
                  value={values.role}
                />
                <span className="field-hint" id={`${baseId}-role-hint`}>
                  Exemplo: QA em transicao para automacao ou Analista de qualidade pleno.
                </span>
                {errors.role ? (
                  <span className="field-error" id={`${baseId}-role-error`}>
                    {errors.role}
                  </span>
                ) : null}
              </label>
            </div>
          </section>

          <div className="field-grid">
            <fieldset className="field-set">
              <legend>Canal preferido para retorno</legend>
              <p className="field-hint">Use as setas do teclado e confira o agrupamento do radio.</p>
              <div className="choice-list">
                <label className="choice-item" htmlFor={`${baseId}-contact-email`}>
                  <input
                    checked={values.preferredContact === 'email'}
                    id={`${baseId}-contact-email`}
                    name="preferredContact"
                    onChange={() => updateField('preferredContact', 'email')}
                    type="radio"
                  />
                  <span>Email</span>
                </label>
                <label className="choice-item" htmlFor={`${baseId}-contact-whatsapp`}>
                  <input
                    checked={values.preferredContact === 'whatsapp'}
                    id={`${baseId}-contact-whatsapp`}
                    name="preferredContact"
                    onChange={() => updateField('preferredContact', 'whatsapp')}
                    type="radio"
                  />
                  <span>WhatsApp</span>
                </label>
                <label className="choice-item" htmlFor={`${baseId}-contact-phone`}>
                  <input
                    checked={values.preferredContact === 'phone'}
                    id={`${baseId}-contact-phone`}
                    name="preferredContact"
                    onChange={() => updateField('preferredContact', 'phone')}
                    type="radio"
                  />
                  <span>Ligacao telefonica</span>
                </label>
              </div>
            </fieldset>

            <fieldset className="field-set">
              <legend>Modelo de trabalho atual</legend>
              <p className="field-hint">Outro grupo de radio para praticar navegação entre controles.</p>
              <div className="choice-list">
                <label className="choice-item" htmlFor={`${baseId}-mode-remote`}>
                  <input
                    checked={values.workMode === 'remote'}
                    id={`${baseId}-mode-remote`}
                    name="workMode"
                    onChange={() => updateField('workMode', 'remote')}
                    type="radio"
                  />
                  <span>Remoto</span>
                </label>
                <label className="choice-item" htmlFor={`${baseId}-mode-hybrid`}>
                  <input
                    checked={values.workMode === 'hybrid'}
                    id={`${baseId}-mode-hybrid`}
                    name="workMode"
                    onChange={() => updateField('workMode', 'hybrid')}
                    type="radio"
                  />
                  <span>Hibrido</span>
                </label>
                <label className="choice-item" htmlFor={`${baseId}-mode-onsite`}>
                  <input
                    checked={values.workMode === 'onsite'}
                    id={`${baseId}-mode-onsite`}
                    name="workMode"
                    onChange={() => updateField('workMode', 'onsite')}
                    type="radio"
                  />
                  <span>Presencial</span>
                </label>
              </div>
            </fieldset>
          </div>

          <section className="panel panel-subtle">
            <fieldset className="field-set">
              <legend>Preferencias de acessibilidade declaradas</legend>
              <p className="field-hint" id={`${baseId}-needs-hint`}>
                Selecione ao menos uma opcao para testar checkbox em grupo com erro compartilhado.
              </p>
              <div className="choice-list choice-list-columns">
                {accessibilityNeedOptions.map((option) => {
                  const optionId = `${baseId}-${option.toLowerCase().replace(/\s+/g, '-')}`;

                  return (
                    <label className="choice-item" htmlFor={optionId} key={option}>
                      <input
                        checked={values.accessibilityNeeds.includes(option)}
                        id={optionId}
                        name="accessibilityNeeds"
                        onChange={handleNeedsChange}
                        type="checkbox"
                        value={option}
                      />
                      <span>{option}</span>
                    </label>
                  );
                })}
              </div>
              {errors.accessibilityNeeds ? (
                <span className="field-error" id={`${baseId}-needs-error`}>
                  {errors.accessibilityNeeds}
                </span>
              ) : null}
            </fieldset>

            <label className="field" htmlFor={`${baseId}-notes`}>
              Observacoes para a equipe de onboarding
              <textarea
                aria-describedby={describedBy(
                  'notes',
                  `${baseId}-notes-hint`,
                  `${baseId}-notes-error`,
                )}
                aria-invalid={Boolean(errors.notes)}
                className="field-control"
                id={`${baseId}-notes`}
                name="notes"
                onChange={(event) => updateField('notes', event.target.value)}
                rows={5}
                value={values.notes}
              />
              <span className="field-hint" id={`${baseId}-notes-hint`}>
                Descreva contexto, equipamentos de apoio ou combinados de acessibilidade.
              </span>
              {errors.notes ? (
                <span className="field-error" id={`${baseId}-notes-error`}>
                  {errors.notes}
                </span>
              ) : null}
            </label>
          </section>

          <section className="panel panel-subtle">
            <label className="field field-toggle" htmlFor={`${baseId}-consent`}>
              <span className="toggle-copy">
                <strong>Consentimento para cadastro simulado</strong>
                <span className="field-hint">
                  Este checkbox existe para praticar validacao obrigatoria em controle booleano.
                </span>
              </span>
              <input
                aria-describedby={errors.consent ? `${baseId}-consent-error` : undefined}
                aria-invalid={Boolean(errors.consent)}
                checked={values.consent}
                className="toggle-control"
                id={`${baseId}-consent`}
                name="consent"
                onChange={(event) => updateField('consent', event.target.checked)}
                type="checkbox"
              />
            </label>
            {errors.consent ? (
              <span className="field-error" id={`${baseId}-consent-error`}>
                {errors.consent}
              </span>
            ) : null}

            <div className="action-row">
              <button className="secondary-button" onClick={handleResetExample} type="button">
                Restaurar exemplo
              </button>
              <button className="primary-button" type="submit">
                Enviar cadastro simulado
              </button>
            </div>
          </section>
        </form>
      </section>
    </section>
  );
}
