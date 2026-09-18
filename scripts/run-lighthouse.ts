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

// Configure upload target based on LHCI_SERVER_BASE_URL presence
let extraFlags = '';
if (process.env.LHCI_SERVER_BASE_URL) {
    extraFlags += ` --upload.serverBaseUrl=${process.env.LHCI_SERVER_BASE_URL}`;
    if (process.env.LHCI_TOKEN) {
        extraFlags += ` --upload.token=${process.env.LHCI_TOKEN}`;
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
