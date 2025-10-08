import path from "path";
import { fileURLToPath } from "url";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import nextConfig from "eslint-config-next";
import reactHooks from "eslint-plugin-react-hooks";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked.map((config) => ({
    ...config,
    languageOptions: {
      ...config.languageOptions,
      parserOptions: {
        ...config.languageOptions?.parserOptions,
        project: ["./tsconfig.json"],
        tsconfigRootDir: __dirname,
      },
    },
  })),
  ...nextConfig,
  {
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.json"],
        tsconfigRootDir: __dirname,
      },
    },
  },
  reactHooks.configs.recommended,
  {
    rules: {
      "react/no-danger": "error",
      "react/no-danger-with-children": "error",
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/lib/api/*", "**/lib/utils/*-server-utils*"],
              message:
                "Server-side modules cannot be imported in client components. Use API routes (e.g., /api/products) instead. See docs/MIGRATION_GUIDE.md for details.",
            },
          ],
        },
      ],
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
  },
];
