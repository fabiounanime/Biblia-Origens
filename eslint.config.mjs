import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";
import quality from "./eslint-rules/index.cjs";

/** ESLint (flat config). Regras e medições: docs/quality.md. */
export default tseslint.config(
  {
    ignores: [
      "dist/**",
      ".output/**",
      ".vercel/**",
      ".nitro/**",
      "node_modules/**",
      "src/routeTree.gen.ts",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx,js,jsx,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  // Regras do Vibe Coding Toolkit (eslint-rules/, autoteste em scripts/verify-quality-rules.mjs).
  // As regras com tipos ficam em eslint.typed.config.mjs (npm run lint:typed).
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { quality },
    rules: {
      // Referência de 350 linhas: aviso, não bloqueio (lista em docs/quality.md). Testes ficam de fora.
      "quality/max-lines": "warn",
      // Telas não importam o banco: dados passam por server functions.
      "quality/no-direct-data-access": [
        "error",
        {
          modules: ["@/lib/db"],
          bindings: ["getSql", "getPglite", "ensureDbReady", "ensureSchema"],
          layers: ["/src/components/"],
          extensions: [".tsx"],
        },
      ],
    },
  },
  {
    files: ["eslint-rules/**/*.cjs"],
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
  // Disable rules that conflict with Prettier formatting.
  prettier,
);
