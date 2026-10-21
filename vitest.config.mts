import path from 'node:path';
import { defineConfig } from 'vitest/config';

// Pruebas de lógica (sin navegador). Corren contra un PGlite en memoria.
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      'server-only': path.resolve(import.meta.dirname, 'tests/unit/vacio.ts'),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
    setupFiles: ['tests/unit/preparar.ts'],
    env: { PGLITE_DIR: 'memory://', AUTH_SECRET: 'secreto-de-pruebas-0123456789abcdefghijklmnop', APP_URL: 'https://pasaporte.example' },
    testTimeout: 30000,
    hookTimeout: 60000,
    fileParallelism: false,
  },
});
