import { createApp } from './app.js';
import { assertCriticalEnvironment, env, getEnvironmentWarnings } from './config/env.js';
import { logger } from './core/logging/logger.js';
import { bootstrapDatabase, createRepositories } from './db/index.js';
import { runMigrations } from './db/migration-runner.js';

function getStartupErrorContext(error) {
  if (!error) {
    return {
      error: 'Unknown startup error'
    };
  }

  if (error instanceof AggregateError) {
    return {
      error: error.message || 'Aggregate startup error',
      code: error.code || null,
      causes: (error.errors || []).map((entry) => ({
        message: entry.message || 'Unknown cause',
        code: entry.code || null,
        address: entry.address || null,
        port: entry.port || null
      }))
    };
  }

  return {
    error: error.message || String(error),
    code: error.code || null
  };
}

async function start() {
  assertCriticalEnvironment();

  const warnings = getEnvironmentWarnings();
  for (const warning of warnings) {
    logger.warn('config.environment_warning', { warning });
  }

  await runMigrations();
  const repositories = createRepositories();
  await bootstrapDatabase(repositories);
  const mappedBusiness = env.twilio.phoneNumber
    ? await repositories.businesses.getByTwilioPhone(env.twilio.phoneNumber)
    : null;

  const app = createApp({ repositories });

  app.listen(env.port, () => {
    logger.info('api.started', {
      port: env.port,
      appUrl: env.appUrl,
      frontendAppUrl: env.frontendAppUrl,
      twilioPhoneConfigured: Boolean(env.twilio.phoneNumber),
      signatureValidationEnabled: env.twilio.validateSignatures,
      mappedBusinessStatus: mappedBusiness?.status || null,
      onboardingCompleted: Boolean(mappedBusiness?.onboardingCompletedAt)
    });
  });
}

start().catch((error) => {
  logger.error('api.start_failed', getStartupErrorContext(error));
  process.exit(1);
});
