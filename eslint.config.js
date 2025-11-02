import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", "node_modules", "*.config.js", "*.config.ts"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      
      // TypeScript
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": ["warn", { 
        ignoreRestArgs: true,
        fixToUnknown: false
      }],
      "@typescript-eslint/no-empty-object-type": ["warn", {
        allowInterfaces: "always"
      }],
      
      // React Hooks
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/rules-of-hooks": "error",
    },
  },
  // Configuração específica para arquivos de teste
  {
    files: ["**/*.test.{ts,tsx}", "**/__tests__/**/*", "**/test/**/*"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off", // Permitir any em testes
    },
  },
  // Configuração específica para arquivos de configuração
  {
    files: ["*.config.{js,ts}", "vite.config.ts", "vitest.config.ts", "tailwind.config.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off",
    },
  },
);
