import astroPlugin from 'eslint-plugin-astro';

/**
 * ESLint covers exactly what Oxlint cannot reach: Astro templates.
 *
 * Oxlint parses the `<script>` block of a `.astro` file but has no template parser, so the
 * `astro/*` rules (set-directive conflicts, client-only directive values, deprecated helpers,
 * …) would silently disappear from the templates in this site. Everything else in the repo is
 * linted by Oxlint through the `lint` block in `vite.config.ts` (`pnpm lint` runs both).
 */
export default [
    {
        ignores: [
            '.astro/**',
            'out/**',
            'dist/**',
            'node_modules/**',
            'coverage/**',
            'test-results/**',
            'playwright-report/**',
            'public/**',
        ],
    },
    ...astroPlugin.configs.recommended,
];
