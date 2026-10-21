import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Compilaciones de las pruebas de punta a punta (NEXT_DIST_DIR), datos locales y capturas.
    ".next-*/**",
    ".data/**",
    "capturas/**",
    "test-results/**",
    "playwright-report/**",
  ]),
]);

export default eslintConfig;
