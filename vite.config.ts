import { defineConfig } from 'vite-plus';

/**
 * Vite+ project toolchain: formatting (Oxfmt), linting (Oxlint), type checking (tsgolint)
 * and staged-file checks.
 *
 * `pnpm check` runs format + lint + type check in one pass; `pnpm lint` adds the ESLint pass
 * over Astro templates. Astro owns the dev server and the static build in `astro.config.mjs`
 * (Astro does not read this file) and Vitest runs from `vitest.config.ts`.
 *
 * Astro templates are the deliberate gap in this setup: Oxlint parses `<script>` blocks in
 * `.astro` files but has no template parser, and tsgolint cannot type-check templates.
 * That coverage is provided by ESLint (`eslint.config.mjs`) and `astro check`.
 */

/** Build and report output directories, skipped by format and lint. */
const generated = [
    'node_modules/**',
    'out/**',
    'dist/**',
    '.astro/**',
    'coverage/**',
    'test-results/**',
    'playwright-report/**',
];

export default defineConfig({
    fmt: {
        // Repo style: 4 spaces, 100 columns, single quotes, semicolons, es5 trailing commas.
        tabWidth: 4,
        printWidth: 100,
        singleQuote: true,
        semi: true,
        trailingComma: 'es5',
        // `.astro` formatting is delegated to prettier-plugin-astro, which requires
        // @astrojs/compiler-rs to be installed.
        astro: true,
        // Tailwind class sorting (prettier-plugin-tailwindcss algorithm) + import sorting.
        sortTailwindcss: true,
        sortImports: true,
        ignorePatterns: generated,
    },
    lint: {
        // `.astro` is linted by ESLint, which owns the Astro template rules Oxlint cannot
        // express, so nothing is checked twice.
        ignorePatterns: [...generated, '**/*.astro'],
        options: {
            typeAware: true,
            typeCheck: true,
        },
        // Oxlint's `react` plugin also carries the React hooks rules.
        plugins: ['eslint', 'typescript', 'react'],
        categories: {
            correctness: 'error',
            suspicious: 'error',
            pedantic: 'off',
            style: 'off',
            perf: 'off',
            restriction: 'off',
            nursery: 'off',
        },
        rules: {
            'no-console': 'warn',
            'no-unused-vars': 'off',
            'typescript/no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                },
            ],
            // JSX runtime is automatic.
            'react/react-in-jsx-scope': 'off',
            // Parity with the previous ESLint setup: Oxlint enables several type-aware *strict*
            // rules by default that were never part of the old `recommended` sets. They stay off
            // until the remaining call sites are cleaned up deliberately, rule by rule.
            'typescript/no-unsafe-type-assertion': 'off',
            'typescript/no-base-to-string': 'off',
            'typescript/consistent-return': 'off',
            // A window-level hydration flag is a deliberate `__NAME__` marker.
            'no-underscore-dangle': 'off',
            // Render props (FullCalendar `eventContent`, …) are components by design.
            'react/no-unstable-nested-components': 'off',
        },
        overrides: [
            {
                // Build scripts are CLIs: console output is their product.
                files: ['scripts/**/*.ts'],
                rules: { 'no-console': 'off' },
            },
        ],
    },
    staged: {
        '*': 'vp check --fix',
    },
});
