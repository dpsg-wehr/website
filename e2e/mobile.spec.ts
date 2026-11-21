import { test, expect } from '@playwright/test';

import { ENABLE_MITGLIEDERPORTAL } from '../src/lib/config';

test.use({
    viewport: { width: 390, height: 844 },
    userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1',
});

test.describe('Mobile Menu', () => {
    test('should open and close the mobile sidebar', async ({ page }) => {
        await page.goto('/');

        // 1. Hamburger menu should be visible on mobile
        const menuButton = page.getByRole('button', { name: 'Toggle navigation' });
        await expect(menuButton).toBeVisible();

        // 2. Click to open sidebar
        await menuButton.click();

        // 3. Verify sidebar is visible
        const sidebar = page.getByTestId('mobile-sidebar');
        await expect(sidebar).toBeInViewport();

        // 4. Close using the same toggle button (which should now be a close icon)
        await menuButton.click();

        // 5. Verify sidebar is hidden (off-screen)
        await expect(sidebar).not.toBeInViewport();
    });

    test('displays campflow portal login link in mobile sidebar when enabled', async ({ page }) => {
        await page.goto('/');

        const menuButton = page.getByRole('button', { name: 'Toggle navigation' });
        await menuButton.click();

        const sidebar = page.getByTestId('mobile-sidebar');
        await expect(sidebar).toBeInViewport();

        const portalLink = sidebar.getByRole('link', { name: /Mitgliederportal/i });
        if (!ENABLE_MITGLIEDERPORTAL) {
            await expect(portalLink).toHaveCount(0);
            return;
        }

        await expect(portalLink).toBeVisible();
        await expect(portalLink).toHaveAttribute('href', 'https://on.campflow.de/dpsg-wehr/portal');
        await expect(portalLink).toHaveAttribute('target', '_blank');
        await expect(portalLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
});
