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
]);
