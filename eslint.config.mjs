import { defineConfig, globalIgnores } from "eslint/config";
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import nextPlugin from "@next/eslint-plugin-next";

/**
 * Flat config. Note: eslint-config-next@15.5.x ships legacy (eslintrc) format
 * only, so we compose the equivalent directly: base JS + TS rules plus the
 * Next.js flat config (core-web-vitals) from @next/eslint-plugin-next.
 */
const eslintConfig = defineConfig([
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
  js.configs.recommended,
  ...tseslint.configs.recommended,
  nextPlugin.flatConfig.coreWebVitals,
  {
    rules: {
      // Lab hygiene: no emojis in UI strings, no console in client code.
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
  {
    files: ["scripts/**/*.mjs"],
    languageOptions: { globals: globals.node },
    rules: { "no-console": "off" },
  },
]);

export default eslintConfig;
