import { test, expect } from '@playwright/test';

test.describe('Legal Pages', () => {
    test('Impressum page should load', async ({ page }) => {
        await page.goto('/pages/impressum');
        await expect(page.getByRole('heading', { name: 'Impressum' })).toBeVisible();

        const editButton = page.getByTestId('cms-edit-button');
        await expect(editButton).toBeVisible();
        await expect(editButton).toHaveAttribute(
            'href',
            'https://dev.dpsg-wehr.de/admin/#/collections/pages/entries/impressum'
        );
    });

    test('Datenschutz page should load', async ({ page }) => {
        await page.goto('/pages/datenschutz');
        await expect(page.getByRole('heading', { name: 'Datenschutzerklärung' })).toBeVisible();

        const editButton = page.getByTestId('cms-edit-button');
        await expect(editButton).toBeVisible();
        await expect(editButton).toHaveAttribute(
            'href',
            'https://dev.dpsg-wehr.de/admin/#/collections/pages/entries/datenschutz'
        );
    });
});
