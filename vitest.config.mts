import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';

export default defineConfig({
    plugins: [react()],
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
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./', import.meta.url)),
        },
    },
});
