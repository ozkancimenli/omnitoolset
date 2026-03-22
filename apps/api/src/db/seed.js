import { createRepositories, bootstrapDatabase } from './index.js';
import { closeDatabase } from './client.js';
import { runMigrations } from './migration-runner.js';

async function seed() {
  await runMigrations();
  const repositories = createRepositories();
  const business = await bootstrapDatabase(repositories);
  console.log(`Seeded business ${business.slug}`);
}

seed()
  .then(async () => {
    await closeDatabase();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error(error);
    await closeDatabase();
    process.exit(1);
  });
