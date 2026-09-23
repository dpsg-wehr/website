import type { APIRoute } from 'astro';
import { execSync } from 'node:child_process';

export const prerender = true;

function getGitCommit(): string {
    if (process.env.PUBLIC_GIT_COMMIT) return process.env.PUBLIC_GIT_COMMIT;
    if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA;
    try {
        return execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
    } catch {
        return 'unknown';
    }
}

function getGitBranch(): string {
    if (process.env.PUBLIC_GIT_BRANCH) return process.env.PUBLIC_GIT_BRANCH;
    if (process.env.PUBLIC_GIT_REF) {
        return process.env.PUBLIC_GIT_REF.replace(/^refs\/heads\//, '');
    }
    if (process.env.GITHUB_REF_NAME) return process.env.GITHUB_REF_NAME;
    try {
        return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
    } catch {
        return 'unknown';
    }
}

function getAppEnv(branch: string): string {
    if (process.env.PUBLIC_APP_ENV) return process.env.PUBLIC_APP_ENV;
    if (branch === 'main') return 'production';
    if (branch === 'dev') return 'staging';
    return 'development';
}

export const GET: APIRoute = async () => {
    const commit = getGitCommit();
    const shortCommit = commit !== 'unknown' ? commit.slice(0, 7) : 'unknown';
    const branch = getGitBranch();
    const env = getAppEnv(branch);

    const buildInfo = {
        commit,
        shortCommit,
        branch,
        env,
        builtAt: new Date().toISOString(),
    };

    return new Response(JSON.stringify(buildInfo, null, 2), {
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
    });
};
