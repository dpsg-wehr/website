import { execSync } from 'child_process';
import { chromium } from '@playwright/test';
import { generateDashboard } from './generate-test-dashboard';

// Ensure CHROME_PATH is set to Playwright's chromium if not already provided
if (!process.env.CHROME_PATH) {
    try {
        process.env.CHROME_PATH = chromium.executablePath();
    } catch {
        // Fall back to system chrome if playwright path fails
    }
}

const args = process.argv.slice(2).join(' ');
const cmd = `lhci autorun ${args}`.trim();

try {
    execSync(cmd, { stdio: 'inherit', env: process.env });
} catch {
    try {
        generateDashboard();
    } catch (e) {
        console.error('Failed to generate test dashboard on error:', e);
    }
    process.exit(1);
}

// Automatically organize lighthouse reports and generate unified test dashboard
try {
    generateDashboard();
} catch (e) {
    console.error('Failed to generate test dashboard:', e);
}
