const requiredVariables = ['DATABASE_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'] as const;

type EnvironmentRecord = Record<string, string | undefined>;

export function validateEnvironment(config: EnvironmentRecord): EnvironmentRecord {
  const missingVariables = requiredVariables.filter((key) => !config[key]);

  if (missingVariables.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVariables.join(', ')}`);
  }

  const port = Number(config.PORT ?? 3001);
  const frontendUrl = config.FRONTEND_URL ?? 'http://localhost:5173';

  if (Number.isNaN(port) || port <= 0) {
    throw new Error('PORT must be a valid positive number');
  }

  if (!frontendUrl.startsWith('http://') && !frontendUrl.startsWith('https://')) {
    throw new Error('FRONTEND_URL must be a valid absolute URL');
  }

  return config;
}
