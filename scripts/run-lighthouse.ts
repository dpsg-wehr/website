import { execSync } from 'child_process';
import { chromium } from '@playwright/test';

// Ensure CHROME_PATH is set to Playwright's chromium if not already provided
if (!process.env.CHROME_PATH) {
    try {
        process.env.CHROME_PATH = chromium.executablePath();
    } catch {
        // Fall back to system chrome if playwright path fails
    }
}

// Configure upload target based on LHCI_SERVER_BASE_URL (or LHCI_SERVER_URL) presence
const lhciServerUrl = (process.env.LHCI_SERVER_BASE_URL || process.env.LHCI_SERVER_URL)?.replace(
    /^['"]|['"]$/g,
    ''
);
const lhciToken = process.env.LHCI_TOKEN?.replace(/^['"]|['"]$/g, '');

let extraFlags = '';
if (lhciServerUrl) {
    extraFlags += ` --upload.serverBaseUrl=${lhciServerUrl}`;
    if (lhciToken) {
        extraFlags += ` --upload.token=${lhciToken}`;
    }
} else if (!process.argv.slice(2).some((a) => a.includes('upload.target'))) {
    extraFlags = ' --upload.target=filesystem --upload.outputDir=./test-results/lighthouse';
}

const args = process.argv.slice(2).join(' ');
const cmd = `lhci autorun ${args}${extraFlags}`.trim();

try {
    execSync(cmd, { stdio: 'inherit', env: process.env });
} catch {
    process.exit(1);
}
