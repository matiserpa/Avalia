// npm run demo:reiniciar — borra TODO y carga los datos de prueba. Sólo para demo y desarrollo.
import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

async function main() {
  if (process.env.DATABASE_URL && process.env.DEMO_MODE !== 'true') {
    console.error('Hay una DATABASE_URL y DEMO_MODE no es "true": no borro nada. Esto es sólo para el ambiente demo.');
    process.exit(1);
  }
  const { migrar } = await import('../src/db/migrar');
  await migrar();
  const { reiniciarDemo } = await import('../src/lib/demo/semilla');
  await reiniciarDemo();
  console.log('Datos de demo cargados.');
  process.exit(0);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
