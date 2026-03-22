import { runMigrations } from './migration-runner.js';
import { closeDatabase } from './client.js';

runMigrations()
  .then(async () => {
    console.log('Migrations complete.');
    await closeDatabase();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error(error);
    await closeDatabase();
    process.exit(1);
  });
