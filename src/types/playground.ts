export type LabDifficulty = 'fundamentos' | 'intermediario' | 'avancado';
export type LabStatus = 'ready' | 'alpha';
export type UserRole = 'ADMIN' | 'OPERATOR';
export type Platform = 'web' | 'mobile' | 'backoffice';
export type LaunchMode = 'immediate' | 'scheduled';
export type JourneyType = 'checkout' | 'authentication' | 'catalog';
export type RiskLevel = 'low' | 'moderate' | 'high';
export type SupportChannel = 'slack' | 'teams' | 'email' | 'pagerduty';
export type AdvancedFormScenarioId =
  | 'happy'
  | 'slug-conflict'
  | 'session-expired'
  | 'forbidden'
  | 'server-error';

export interface LabDefinition {
  id: string;
  slug: string;
  title: string;
  summary: string;
  difficulty: LabDifficulty;
  status: LabStatus;
  estimatedTime: string;
  skills: string[];
  route: string;
}

export interface ScenarioDefinition {
  id: string;
  labId: string;
  title: string;
  expectedBehavior: string;
  seedKey: string;
  tags: string[];
}

export interface MockContract<TRequest, TResponse> {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  requestExample?: TRequest;
  responseExample: TResponse;
  errorStatuses: number[];
}

export interface ChallengeGuide {
  labId: string;
  goals: string[];
  successCriteria: string[];
  notes: string[];
}

export interface AuthSession {
  token: string;
  role: UserRole;
  name: string;
  email: string;
}

export interface AuthLoginRequest {
  email: string;
  password: string;
}

export interface AuthLoginResponse extends AuthSession {
  message: string;
}

export interface HealthResponse {
  status: 'ok';
  timestamp: string;
  environment: 'mock';
  version: string;
}

export interface SlugValidationRequest {
  slug: string;
}

export interface SlugValidationResponse {
  available: boolean;
  reason?: string;
}

export interface Checkpoint {
  label: string;
  url: string;
}

export interface AdvancedFormPayload {
  name: string;
  slug: string;
  platform: Platform;
  ownerTeam: string;
  journeyType: JourneyType;
  launchMode: LaunchMode;
  scheduledAt?: string;
  riskLevel: RiskLevel;
  requiresApproval: boolean;
  approverEmail?: string;
  supportChannel: SupportChannel;
  accessibilityReview: boolean;
  observabilityNotes?: string;
  checkpoints: Checkpoint[];
}

export interface SubmissionResponse {
  id: string;
  status: 'queued';
  submittedAt: string;
  slug: string;
  ownerTeam: string;
  scenario: AdvancedFormScenarioId;
}
