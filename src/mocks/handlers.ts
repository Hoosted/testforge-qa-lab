import { delay, http, HttpResponse } from 'msw';
import { contractCatalog, seedCredentials } from '@/data/playground';
import type {
  AdvancedFormPayload,
  AdvancedFormScenarioId,
  AuthLoginRequest,
  AuthLoginResponse,
  AuthSession,
  HealthResponse,
  SlugValidationRequest,
  SlugValidationResponse,
  SubmissionResponse,
} from '@/types/playground';

const issuedSessions = new Map<string, AuthSession>();
const knownSlugs = new Set(['checkout-guard', 'mobile-core-freeze', 'catalog-observability']);

function readScenario(request: Request): AdvancedFormScenarioId {
  const scenario = request.headers.get('x-testforge-scenario');

  if (
    scenario === 'happy' ||
    scenario === 'slug-conflict' ||
    scenario === 'session-expired' ||
    scenario === 'forbidden' ||
    scenario === 'server-error'
  ) {
    return scenario;
  }

  return 'happy';
}

function buildToken(email: string) {
  return `seed-${email.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`;
}

function resolveSession(request: Request) {
  const authorization = request.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return null;
  }

  const token = authorization.replace('Bearer ', '');
  return issuedSessions.get(token) ?? null;
}

export const handlers = [
  http.get('/api/health', async () => {
    await delay(160);

    const response: HealthResponse = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: 'mock',
      version: 'v1',
    };

    return HttpResponse.json(response);
  }),

  http.get('/api/contracts', async () => {
    await delay(120);
    return HttpResponse.json(contractCatalog);
  }),

  http.post('/api/auth/login', async ({ request }) => {
    await delay(260);

    const body = (await request.json()) as AuthLoginRequest;
    const matchedSeed = seedCredentials.find(
      (seed) => seed.email === body.email && seed.password === body.password,
    );

    if (!matchedSeed) {
      return HttpResponse.json(
        { message: 'Credenciais invalidas para o sandbox.' },
        { status: 401 },
      );
    }

    const session: AuthLoginResponse = {
      token: buildToken(matchedSeed.email),
      role: matchedSeed.role,
      email: matchedSeed.email,
      name: matchedSeed.role === 'ADMIN' ? 'TestForge Admin' : 'TestForge Operator',
      message: 'Sessao iniciada em modo sandbox.',
    };

    issuedSessions.set(session.token, session);

    return HttpResponse.json(session);
  }),

  http.post('/api/labs/advanced-form/validate-slug', async ({ request }) => {
    await delay(220);

    const scenario = readScenario(request);
    const body = (await request.json()) as SlugValidationRequest;
    const slug = body.slug.trim().toLowerCase();

    const response: SlugValidationResponse =
      scenario === 'slug-conflict' || knownSlugs.has(slug)
        ? {
            available: false,
            reason: 'Esse identificador ja esta reservado por outra seed.',
          }
        : {
            available: true,
          };

    return HttpResponse.json(response);
  }),

  http.post('/api/labs/advanced-form/submissions', async ({ request }) => {
    await delay(320);

    const scenario = readScenario(request);
    const session = resolveSession(request);

    if (scenario === 'session-expired') {
      return HttpResponse.json(
        { message: 'Sua sessao sandbox expirou. Entre novamente para concluir.' },
        { status: 401 },
      );
    }

    if (!session) {
      return HttpResponse.json(
        { message: 'Autenticacao obrigatoria para enviar o lab.' },
        { status: 401 },
      );
    }

    if (scenario === 'forbidden' || session.role !== 'ADMIN') {
      return HttpResponse.json(
        { message: 'Apenas administradores podem enfileirar um rollout.' },
        { status: 403 },
      );
    }

    if (scenario === 'server-error') {
      return HttpResponse.json(
        { message: 'Falha controlada do sandbox para testes de resiliencia.' },
        { status: 500 },
      );
    }

    const body = (await request.json()) as AdvancedFormPayload;
    const slug = body.slug.trim().toLowerCase();

    if (knownSlugs.has(slug)) {
      return HttpResponse.json(
        { message: 'Esse slug ja foi utilizado por uma submissao anterior.' },
        { status: 409 },
      );
    }

    knownSlugs.add(slug);

    const response: SubmissionResponse = {
      id: `submission_${knownSlugs.size}`,
      status: 'queued',
      submittedAt: new Date().toISOString(),
      slug,
      ownerTeam: body.ownerTeam,
      scenario,
    };

    return HttpResponse.json(response, { status: 201 });
  }),
];
