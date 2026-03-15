export interface Healthcheck {
  status: 'ok';
  service: string;
  version: string;
  timestamp: string;
}

export const healthcheck: Omit<Healthcheck, 'timestamp'> = {
  status: 'ok',
  service: 'testforge-api',
  version: '0.1.0',
};

export const userRoles = ['ADMIN', 'OPERATOR'] as const;

export type UserRole = (typeof userRoles)[number];

export interface AuthPermissionMap {
  canAccessAdminArea: boolean;
  canAccessOperatorArea: boolean;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: AuthPermissionMap;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
}

export interface AuthSessionResponse extends AuthTokens {
  user: AuthUser;
}

export interface AuthMessageResponse {
  message: string;
}

export interface ApiErrorResponse {
  statusCode: number;
  path: string;
  timestamp: string;
  message: string | string[];
}
