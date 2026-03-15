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
