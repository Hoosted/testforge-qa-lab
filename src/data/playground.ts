import type {
  AdvancedFormPayload,
  AdvancedFormScenarioId,
  AuthLoginRequest,
  AuthLoginResponse,
  ChallengeGuide,
  HealthResponse,
  LabDefinition,
  MockContract,
  Platform,
  ScenarioDefinition,
  SlugValidationRequest,
  SlugValidationResponse,
  SubmissionResponse,
  SupportChannel,
} from '@/types/playground';

export const seedCredentials = [
  {
    label: 'Admin seed',
    email: 'admin@testforge.dev',
    password: 'TestForge@123',
    role: 'ADMIN',
  },
  {
    label: 'Operator seed',
    email: 'operator@testforge.dev',
    password: 'TestForge@123',
    role: 'OPERATOR',
  },
] as const;

export const labs: LabDefinition[] = [
  {
    id: 'advanced-form',
    slug: 'formulario-avancado',
    title: 'Advanced Form Lab',
    summary:
      'Wizard com validacoes sincrona e assincrona, campos condicionais, repetiveis, auth por perfil e erros HTTP controlados.',
    difficulty: 'avancado',
    status: 'ready',
    estimatedTime: '35-50 min',
    skills: ['ui-automation', 'api', 'auth', 'a11y'],
    route: '/labs/formulario-avancado',
  },
  {
    id: 'auth-lab',
    slug: 'auth',
    title: 'Auth Lab',
    summary:
      'Pratique login, logout, sessao expirada e diferencas reais entre perfis admin e operator.',
    difficulty: 'intermediario',
    status: 'ready',
    estimatedTime: '15-20 min',
    skills: ['auth', 'api'],
    route: '/labs/auth',
  },
  {
    id: 'api-lab',
    slug: 'api',
    title: 'API Lab',
    summary:
      'Inspecione contratos mockados, dispare requests previsiveis e valide estados 200, 401, 403, 409 e 500.',
    difficulty: 'intermediario',
    status: 'ready',
    estimatedTime: '20-30 min',
    skills: ['api', 'contract-testing'],
    route: '/labs/api',
  },
  {
    id: 'a11y-lab',
    slug: 'acessibilidade',
    title: 'Accessibility Lab',
    summary:
      'Exercite foco visivel, landmarks, feedback dinamico e mensagens de erro ligadas aos campos.',
    difficulty: 'fundamentos',
    status: 'ready',
    estimatedTime: '10-15 min',
    skills: ['a11y', 'ui-automation'],
    route: '/labs/acessibilidade',
  },
];

export const guides: ChallengeGuide[] = [
  {
    labId: 'advanced-form',
    goals: [
      'navegar um wizard de multiplas etapas',
      'validar mensagens sincrona e assincrona',
      'observar diferenca entre falha de cenario e falha por perfil',
    ],
    successCriteria: [
      'o envio feliz retorna status queued',
      'slug conflitante e detectado antes do submit',
      '401, 403 e 500 aparecem com mensagens diferentes',
    ],
    notes: [
      'use as seeds publicadas no Auth Lab',
      'altere o cenario antes do submit para testar falhas controladas',
    ],
  },
  {
    labId: 'auth-lab',
    goals: ['autenticar com contas seedadas', 'comparar permissoes', 'simular expiracao'],
    successCriteria: [
      'login persiste sessao local',
      'operator nao consegue escrever no lab avancado',
    ],
    notes: ['o projeto nao usa auth externa na v1'],
  },
  {
    labId: 'api-lab',
    goals: ['inspecionar contratos', 'acionar requests conhecidas'],
    successCriteria: ['respostas retornam payloads consistentes', 'status de erro sao previsiveis'],
    notes: ['todos os exemplos usam a mesma camada MSW da aplicacao'],
  },
  {
    labId: 'a11y-lab',
    goals: ['testar landmarks', 'navegar por teclado', 'verificar feedback dinamico'],
    successCriteria: ['foco visivel', 'regioes nomeadas', 'mensagens de erro associadas'],
    notes: ['o objetivo e exercitar leitura e automacao, nao esconder problemas'],
  },
];

export const advancedFormScenarios: ScenarioDefinition[] = [
  {
    id: 'happy',
    labId: 'advanced-form',
    title: 'Fluxo feliz',
    expectedBehavior: 'Slug disponivel e envio concluido com status queued.',
    seedKey: 'scenario:happy',
    tags: ['200', 'ready'],
  },
  {
    id: 'slug-conflict',
    labId: 'advanced-form',
    title: 'Conflito de slug',
    expectedBehavior: 'A validacao assincrona marca o identificador como indisponivel.',
    seedKey: 'scenario:slug-conflict',
    tags: ['409', 'validation'],
  },
  {
    id: 'session-expired',
    labId: 'advanced-form',
    title: 'Sessao expirada',
    expectedBehavior: 'O submit retorna 401 com orientacao para autenticar novamente.',
    seedKey: 'scenario:session-expired',
    tags: ['401', 'auth'],
  },
  {
    id: 'forbidden',
    labId: 'advanced-form',
    title: 'Permissao negada',
    expectedBehavior: 'O submit retorna 403 por role ou cenario forcado.',
    seedKey: 'scenario:forbidden',
    tags: ['403', 'authz'],
  },
  {
    id: 'server-error',
    labId: 'advanced-form',
    title: 'Falha de servidor',
    expectedBehavior: 'O submit retorna 500 sem alterar a seed.',
    seedKey: 'scenario:server-error',
    tags: ['500', 'retry'],
  },
];

export const ownerTeamsByPlatform: Record<Platform, string[]> = {
  web: ['Checkout', 'Growth', 'Observabilidade'],
  mobile: ['Mobile Core', 'Subscriptions', 'Performance'],
  backoffice: ['Fraude', 'Operacoes', 'Catalogo'],
};

export const supportChannelsByPlatform: Record<Platform, SupportChannel[]> = {
  web: ['slack', 'teams', 'email'],
  mobile: ['slack', 'pagerduty', 'email'],
  backoffice: ['teams', 'email', 'pagerduty'],
};

export const contractCatalog: Array<
  | MockContract<Record<string, never>, HealthResponse>
  | MockContract<AuthLoginRequest, AuthLoginResponse>
  | MockContract<SlugValidationRequest, SlugValidationResponse>
  | MockContract<AdvancedFormPayload, SubmissionResponse>
> = [
  {
    id: 'health',
    method: 'GET',
    path: '/api/health',
    description: 'Heartbeat da camada mock para validar conectividade basica.',
    responseExample: {
      status: 'ok',
      timestamp: '2026-04-07T00:00:00.000Z',
      environment: 'mock',
      version: 'v1',
    },
    errorStatuses: [],
  },
  {
    id: 'login',
    method: 'POST',
    path: '/api/auth/login',
    description: 'Cria uma sessao local para ADMIN ou OPERATOR usando as seeds publicas.',
    requestExample: {
      email: 'admin@testforge.dev',
      password: 'TestForge@123',
    },
    responseExample: {
      token: 'seed-token-admin',
      role: 'ADMIN',
      name: 'TestForge Admin',
      email: 'admin@testforge.dev',
      message: 'Sessao iniciada em modo sandbox.',
    },
    errorStatuses: [401],
  },
  {
    id: 'validate-slug',
    method: 'POST',
    path: '/api/labs/advanced-form/validate-slug',
    description: 'Valida a disponibilidade de slug para o wizard do lab principal.',
    requestExample: {
      slug: 'checkout-guard-v2',
    },
    responseExample: {
      available: true,
    },
    errorStatuses: [409],
  },
  {
    id: 'submit-advanced-form',
    method: 'POST',
    path: '/api/labs/advanced-form/submissions',
    description: 'Enfileira uma submissao do wizard respeitando cenario e role autenticada.',
    requestExample: {
      name: 'Rollout observavel do checkout',
      slug: 'checkout-guard-v2',
      platform: 'web',
      ownerTeam: 'Checkout',
      journeyType: 'checkout',
      launchMode: 'scheduled',
      scheduledAt: '2026-04-12',
      riskLevel: 'moderate',
      requiresApproval: true,
      approverEmail: 'lead@testforge.dev',
      supportChannel: 'slack',
      accessibilityReview: true,
      observabilityNotes: 'Alarmes e dashboard ja mapeados.',
      checkpoints: [{ label: 'Smoke', url: 'https://status.testforge.dev/smoke' }],
    },
    responseExample: {
      id: 'submission_001',
      status: 'queued',
      submittedAt: '2026-04-07T00:00:00.000Z',
      slug: 'checkout-guard-v2',
      ownerTeam: 'Checkout',
      scenario: 'happy',
    },
    errorStatuses: [401, 403, 409, 500],
  },
];

export const scenarioTone: Record<
  AdvancedFormScenarioId,
  { eyebrow: string; helper: string }
> = {
  happy: {
    eyebrow: 'Flow ready',
    helper: 'Use este modo para validar o caminho feliz e o resumo final.',
  },
  'slug-conflict': {
    eyebrow: 'Validation stress',
    helper: 'Perfeito para cobrir feedback assincrono antes do submit.',
  },
  'session-expired': {
    eyebrow: 'Auth decay',
    helper: 'O submit devolve 401 para exercitar reautenticacao e guardas.',
  },
  forbidden: {
    eyebrow: 'Role guard',
    helper: 'Forca 403 e ajuda a provar que escrever e responsabilidade de admin.',
  },
  'server-error': {
    eyebrow: 'Failure mode',
    helper: 'Retorna 500 para validar banners, retry manual e observabilidade.',
  },
};
