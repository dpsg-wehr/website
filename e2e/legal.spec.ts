import { test, expect } from '@playwright/test';

test.describe('Legal Pages', () => {
    test('Impressum page should load with DDG information and representation', async ({ page }) => {
        await page.goto('/pages/impressum');
        await expect(page.getByRole('heading', { name: 'Impressum' })).toBeVisible();
        await expect(page.getByText('Angaben gemäß § 5 DDG')).toBeVisible();
        await expect(page.getByText('Stamm St. Bernhard Wehr (Baden)').first()).toBeVisible();
        await expect(page.getByText('Rebecca Müller und Thomas Meier')).toBeVisible();

        const editButton = page.getByTestId('cms-edit-button');
        await expect(editButton).toBeVisible();
        await expect(editButton).toHaveAttribute(
            'href',
            'https://dev.dpsg-wehr.de/admin/#/collections/pages/entries/impressum'
        );
    });

    test('Datenschutz page should load with DSGVO, netcup and Campflow details', async ({
        page,
    }) => {
        await page.goto('/pages/datenschutz');
        await expect(page.getByRole('heading', { name: 'Datenschutzerklärung' })).toBeVisible();
        await expect(
            page.getByRole('heading', { name: 'Hinweis zur verantwortlichen Stelle' })
        ).toBeVisible();
        await expect(page.getByText('netcup GmbH')).toBeVisible();
        await expect(page.getByRole('heading', { name: /Campflow/i })).toBeVisible();

        const editButton = page.getByTestId('cms-edit-button');
        await expect(editButton).toBeVisible();
        await expect(editButton).toHaveAttribute(
            'href',
            'https://dev.dpsg-wehr.de/admin/#/collections/pages/entries/datenschutz'
        );
    });

    test('Campflow 2-click consent solution functions on FAQ page', async ({ page }) => {
        await page.goto('/pages/faq');
        await expect(page.getByRole('heading', { name: 'Häufig gestellte Fragen' })).toBeVisible();

        // 2-Click placeholder should be visible initially
        const loadButton = page.getByRole('button', { name: 'Formular laden' });
        await expect(loadButton).toBeVisible();

        const directLink = page.getByRole('link', { name: /Direkt bei Campflow öffnen/i });
        await expect(directLink).toBeVisible();
        await expect(directLink).toHaveAttribute('href', /campflow\.de/);

        // Iframe should be hidden initially
        const iframe = page.locator('iframe[title="Campflow Anmeldeformular"]');
        await expect(iframe).toBeHidden();

        // Click to load
        await loadButton.click();

        // Iframe should now be visible with src loaded
        await expect(iframe).toBeVisible();
        const src = await iframe.getAttribute('src');
        expect(src).toContain('on.campflow.de');
        expect(src).toContain('dpsg-wehr/mitgliedsantrag');

        // Placeholder should be hidden
        await expect(loadButton).toBeHidden();
    });
});
