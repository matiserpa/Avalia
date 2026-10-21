// npm run db:migrar — aplica las migraciones a la base de DATABASE_URL (o a PGlite local).
import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

async function main() {
  const { migrar } = await import('../src/db/migrar');
  await migrar();
  console.log('Migraciones aplicadas.');
  process.exit(0);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
