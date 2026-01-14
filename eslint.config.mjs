import { defineConfig } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([
    // Global ignores - must be first
    {
        ignores: [
            "node_modules/**",
            ".next/**",
            "coverage/**",
            "storybook-static/**",
            "public/sw.js",
            "public/workbox-*.js",
            "*.config.js",
            "*.config.mjs",
        ],
    },
    // Main config
    {
        extends: [
            ...nextCoreWebVitals,
            ...nextTypescript,
            ...compat.extends("plugin:storybook/recommended")
        ],
    },
    // Disable overly strict React 19 rules (new in Next.js 16)
    // These require significant refactoring and are best addressed incrementally
    {
        rules: {
            "react-hooks/set-state-in-effect": "off",
            "react-hooks/static-components": "off",
            "react-hooks/refs": "off",
        },
    },
    // Allow require() in config files
    {
        files: ["tailwind.config.ts"],
        rules: {
            "@typescript-eslint/no-require-imports": "off",
        },
    },
    // Relax rules for test files
    {
        files: ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts", "**/*.spec.tsx", "jest.setup.ts"],
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-unused-vars": "warn",
            "@typescript-eslint/no-require-imports": "off",
            "@typescript-eslint/ban-ts-comment": "off",
            "react/display-name": "off",
            "@next/next/no-img-element": "off",
        },
    },
]);
