// Regras com tipos, fora do eslint.config.mjs de propósito: o projectService monta o programa
// TypeScript inteiro (medido em 22/10/2026: ~11 s e ~850 MB, contra ~2 s e ~500 MB sem tipos).
// `npm run lint` fica rápido; `npm run lint:typed` (e o `verify`) rodam os dois.
import defaultConfig from "./eslint.config.mjs";

export default [
  ...defaultConfig,
  {
    files: ["src/**/*.{ts,tsx}"],
    // Os testes do node:test devolvem promessas de propósito.
    ignores: ["src/**/*.test.ts"],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
    },
  },
];
