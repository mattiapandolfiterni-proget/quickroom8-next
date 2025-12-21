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
  ]),
  // Project uses react-router-dom, not next/link - disable Link warnings
  {
    rules: {
      // Using react-router-dom for routing, not next/link
      "@next/next/no-html-link-for-pages": "off",
      // Allow standard <img> tags (optimization not always needed)
      "@next/next/no-img-element": "warn",
      // TypeScript - downgrade to warnings for faster iteration
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }],
      // Allow @ts-nocheck in shadcn/ui components (generated code)
      "@typescript-eslint/ban-ts-comment": "warn",
      // Allow empty interfaces (common in React component typing)
      "@typescript-eslint/no-empty-object-type": "off",
      // React entities - allow apostrophes and quotes in JSX
      "react/no-unescaped-entities": "warn",
      // React hooks - some patterns are intentional for hydration
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/immutability": "warn",
    },
  },
]);

export default eslintConfig;
