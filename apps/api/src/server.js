import { createApp } from './app.js';
import { assertCriticalEnvironment, env, getEnvironmentWarnings } from './config/env.js';
import { logger } from './core/logging/logger.js';
import { bootstrapDatabase, createRepositories } from './db/index.js';
import { runMigrations } from './db/migration-runner.js';

async function start() {
  assertCriticalEnvironment();

  const warnings = getEnvironmentWarnings();
  for (const warning of warnings) {
    logger.warn('config.environment_warning', { warning });
  }

  await runMigrations();
  const repositories = createRepositories();
  await bootstrapDatabase(repositories);

  const app = createApp({ repositories });

  app.listen(env.port, () => {
    logger.info('api.started', {
      port: env.port,
      appUrl: env.appUrl,
      frontendAppUrl: env.frontendAppUrl
    });
  });
}

start().catch((error) => {
  logger.error('api.start_failed', {
    error: error.message
  });
  process.exit(1);
});
