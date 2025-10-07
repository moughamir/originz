import globals from "globals";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import nextPlugin from "@next/eslint-plugin-next";
import importPlugin from "eslint-plugin-import";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "dist/**", "next-env.d.ts", "public/**", "postcss.config.mjs", "tailwind.config.js", "eslint.config.mjs"],
  },
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        project: ["./tsconfig.json"], 
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      react,
      "react-hooks": reactHooks,
      "@next/next": nextPlugin,
      import: importPlugin,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      "import/no-cycle": ["error", { maxDepth: Infinity }],
      "react/react-in-jsx-scope": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "react/no-danger": "error",
      "react/no-danger-with-children": "error",
      "no-restricted-imports": ["error", {
        patterns: [{
          group: ["**/lib/api/*", "**/lib/utils/*-server-utils*"],
          message: "Server-side modules cannot be imported in client components. Use API routes (e.g., /api/products) instead. See docs/MIGRATION_GUIDE.md for details."
        }]
      }],
    },
  },
  {
    files: [
      "app/api/**/*.ts",
      "app/api/**/*.tsx",
      "app/**/route.ts",
      "app/**/route.tsx",
      "lib/api/**/*.ts",
      "lib/utils/*-server-utils.ts",
      "lib/data/**/*.ts",
    ],
    rules: {
      "no-restricted-imports": "off",
    },
  },
  {
    files: [
      "components/common/product-schema.tsx",
      "components/common/website-schema.tsx",
      "components/common/safe-html.tsx",
    ],
    rules: {
      "react/no-danger": "off",
      "react/no-danger-with-children": "off",
    },
  }
];