import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GET } from '@/pages/version.json';

describe('GET /version.json', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        process.env = { ...originalEnv };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it('should return 200 with JSON content type and no-cache headers', async () => {
        // @ts-expect-error - mock context not required for static GET
        const response = await GET({});
        expect(response.status).toBe(200);
        expect(response.headers.get('Content-Type')).toContain('application/json');
        expect(response.headers.get('Cache-Control')).toContain('no-cache');
    });

    it('should return valid JSON containing commit, shortCommit, branch, env, and builtAt', async () => {
        // @ts-expect-error - mock context not required for static GET
        const response = await GET({});
        const data = await response.json();

        expect(data).not.toHaveProperty('version');
        expect(data).toHaveProperty('commit');
        expect(data).toHaveProperty('shortCommit');
        expect(data).toHaveProperty('branch');
        expect(data).toHaveProperty('env');
        expect(data).toHaveProperty('builtAt');
        expect(typeof data.builtAt).toBe('string');
        expect(new Date(data.builtAt).toISOString()).toBe(data.builtAt);
    });

    it('should prefer environment variables when present and determine env', async () => {
        process.env.PUBLIC_GIT_COMMIT = 'abcdef1234567890abcdef1234567890abcdef12';
        process.env.PUBLIC_GIT_REF = 'refs/heads/main';
        process.env.PUBLIC_APP_ENV = 'production';

        // @ts-expect-error - mock context not required for static GET
        const response = await GET({});
        const data = await response.json();

        expect(data.commit).toBe('abcdef1234567890abcdef1234567890abcdef12');
        expect(data.shortCommit).toBe('abcdef1');
        expect(data.branch).toBe('main');
        expect(data.env).toBe('production');
    });

    it('should map dev branch to staging env by default', async () => {
        process.env.PUBLIC_GIT_REF = 'refs/heads/dev';
        delete process.env.PUBLIC_APP_ENV;

        // @ts-expect-error - mock context not required for static GET
        const response = await GET({});
        const data = await response.json();

        expect(data.branch).toBe('dev');
        expect(data.env).toBe('staging');
    });
});
