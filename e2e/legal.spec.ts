import { test, expect } from '@playwright/test';

test.describe('Legal Pages', () => {
    test('Impressum page should load with DDG information and contact details', async ({
        page,
    }) => {
        await page.goto('/pages/impressum');
        await expect(page.getByRole('heading', { name: 'Impressum' })).toBeVisible();
        await expect(page.getByText('Angaben gemäß § 5 DDG')).toBeVisible();
        await expect(page.getByText('Stamm St. Bernhard Wehr (Baden)').first()).toBeVisible();
        await expect(page.getByText('Rebecca Müller und Thomas Meier')).toBeVisible();

        const emailLink = page.getByRole('link', { name: 'stavo@dpsg-wehr.de' });
        await expect(emailLink).toBeVisible();
        await expect(emailLink).toHaveAttribute('href', 'mailto:stavo@dpsg-wehr.de');

        const phoneLink = page.getByRole('link', { name: '015679 832718' });
        await expect(phoneLink).toBeVisible();
        await expect(phoneLink).toHaveAttribute('href', 'tel:+4915679832718');

        await expect(
            page.getByRole('heading', { name: 'Urheberrecht und Markenzeichen' })
        ).toBeVisible();
    });

    test('Datenschutz page should load', async ({ page }) => {
        await page.goto('/pages/datenschutz');
        await expect(page.getByRole('heading', { name: 'Datenschutzerklärung' })).toBeVisible();
    });
});
