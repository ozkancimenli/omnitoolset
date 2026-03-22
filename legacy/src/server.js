import { logger } from './core/logging/logger.js';
import { assertCriticalEnvironment, env, getEnvironmentWarnings } from './config/env.js';
import { createApp } from './app.js';

assertCriticalEnvironment();

for (const warning of getEnvironmentWarnings()) {
  logger.warn('platform.environment_warning', {
    warning
  });
}

const { app } = createApp();

app.listen(env.port, () => {
  console.log(`OmniToolset listening on ${env.appUrl || `http://localhost:${env.port}`}`);
});
