import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.config({
    extends: ["next/core-web-vitals", "next/typescript"],
    rules: {
      "prefer-const": "off",
      "react-hooks/rules-of-hooks": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/prefer-as-const": "off",
      "@next/next/no-async-client-component": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "react-hooks/exhaustive-deps": "off",
      "@next/next/no-img-element": "off",
      "jsx-a11y/alt-text": "off",
      "react/no-unescaped-entities": "off",
    },
  }),
  {
    ignores: [
      "**/temp.js",
      "config/*",
      "**/dist",
      "**/build",
      "**/out",
      "**/coverage",
      "**/node_modules",
      "**/.next",
      "**/.turbo",
      "./src/generated/prisma",
      "**/src/generated/prisma",
    ],
  },
];

export default eslintConfig;
