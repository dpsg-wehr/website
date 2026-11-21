import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

/**
 * Unit/component tests (Vitest). `pnpm test` (`vp test`) picks this file up.
 *
 * The Vite+ toolchain blocks (format, lint, staged) live in `vite.config.ts`; Astro reads
 * `astro.config.mjs` for the site build. A dedicated Vitest config keeps the React plugin's
 * `vite` types and Vitest's own types on the same copy of Vite.
 */
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@/content': fileURLToPath(new URL('./content', import.meta.url)),
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    test: {
        environment: 'jsdom',
        setupFiles: ['./vitest-setup.ts'],
        exclude: ['**/node_modules/**', '**/e2e/**', '**/dist/**'],
        reporters: [
            'default',
            [
                'html',
                {
                    outputDir: './test-results/unit',
                },
            ],
        ],
    },
});
