import { test, expect } from '@playwright/test';

test.describe('Legal Pages', () => {
    test('Impressum page should load with DDG information and representation', async ({ page }) => {
        await page.goto('/pages/impressum');
        await expect(page.getByRole('heading', { name: 'Impressum' })).toBeVisible();
        await expect(page.getByText('Angaben gemäß § 5 DDG')).toBeVisible();
        await expect(page.getByText('Stamm St. Bernhard Wehr (Baden)').first()).toBeVisible();
        await expect(page.getByText('Rebecca Müller und Thomas Meier')).toBeVisible();

        const phoneLink = page.getByRole('link', { name: '015679 832718' });
        await expect(phoneLink).toBeVisible();
        await expect(phoneLink).toHaveAttribute('href', 'tel:+4915679832718');

        const editButton = page.getByTestId('cms-edit-button');
        await expect(editButton).toBeVisible();
        await expect(editButton).toHaveAttribute(
            'href',
            'https://dev.dpsg-wehr.de/admin/#/collections/pages/entries/impressum'
        );
    });

    test('Datenschutz page should load with DSGVO, netcup, Campflow, OpenStreetMap and Umami Opt-Out', async ({
        page,
    }) => {
        await page.goto('/pages/datenschutz');
        await expect(page.getByRole('heading', { name: 'Datenschutzerklärung' })).toBeVisible();
        await expect(
            page.getByRole('heading', { name: 'Hinweis zur verantwortlichen Stelle' })
        ).toBeVisible();
        await expect(page.getByText('netcup GmbH').first()).toBeVisible();
        await expect(page.getByRole('heading', { name: /Campflow/i })).toBeVisible();
        await expect(page.getByRole('heading', { name: /OpenStreetMap/i })).toBeVisible();
        await expect(page.getByRole('heading', { name: /Umami/i })).toBeVisible();

        // Check Umami Opt-Out interactive component
        await expect(page.getByTestId('umami-opt-out-container')).toBeVisible();
        const optOutBtn = page.getByTestId('umami-opt-out-button');
        await expect(optOutBtn).toBeVisible();

        // Default state: tracking is active / not opted out
        await expect(page.getByTestId('opt-out-badge-enabled')).toBeVisible();

        // Click to opt out
        await optOutBtn.click();
        await expect(page.getByTestId('opt-out-badge-disabled')).toBeVisible();
        const isOptedOut = await page.evaluate(() => localStorage.getItem('umami.disabled'));
        expect(isOptedOut).toBe('1');

        // Click again to re-enable
        await optOutBtn.click();
        await expect(page.getByTestId('opt-out-badge-enabled')).toBeVisible();
        const isOptedOutAfter = await page.evaluate(() => localStorage.getItem('umami.disabled'));
        expect(isOptedOutAfter).toBeNull();

        const editButton = page.getByTestId('cms-edit-button');
        await expect(editButton).toBeVisible();
        await expect(editButton).toHaveAttribute(
            'href',
            'https://dev.dpsg-wehr.de/admin/#/collections/pages/entries/datenschutz'
        );
    });

    test('Campflow 2-click consent solution functions on Anmeldung page', async ({ page }) => {
        await page.goto('/pages/anmeldung');
        await expect(page.getByRole('heading', { name: 'Anmeldung', exact: true })).toBeVisible();

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

    test('Campflow consent placeholder is clearly visible in dark mode', async ({ page }) => {
        await page.emulateMedia({ colorScheme: 'dark' });
        await page.goto('/pages/anmeldung');

        const wrapper = page.locator('[data-campflow-wrapper]');
        await expect(wrapper).toBeVisible();

        const strongCampflow = wrapper.locator('strong', { hasText: 'Campflow' });
        await expect(strongCampflow).toBeVisible();

        // Verify contrast / computed styling: strong text and wrapper background
        const colors = await page.evaluate(() => {
            const wrap = document.querySelector('[data-campflow-wrapper]');
            const strong = wrap ? wrap.querySelector('strong') : null;
            if (!wrap || !strong) return null;
            const wrapBg = window.getComputedStyle(wrap).backgroundColor;
            const strongColor = window.getComputedStyle(strong).color;
            return { wrapBg, strongColor };
        });

        expect(colors).not.toBeNull();
        expect(colors!.wrapBg).not.toBe(colors!.strongColor);
    });

    test('Kontakt page should load with contact details and OpenStreetMap 2-click consent', async ({
        page,
    }) => {
        await page.goto('/pages/kontakt');
        await expect(page.getByRole('heading', { name: 'Kontakt' })).toBeVisible();
        await expect(page.getByText('Rebecca Müller und Thomas Meier')).toBeVisible();
        await expect(page.getByText('stavo@dpsg-wehr.de')).toBeVisible();
        await expect(page.getByText('Kirchplatz')).toBeVisible();

        // 2-Click OSM placeholder should be visible initially
        const loadMapBtn = page.getByRole('button', { name: 'Karte laden' });
        await expect(loadMapBtn).toBeVisible();

        const osmLink = page.getByRole('link', {
            name: /Größere Karte direkt bei OpenStreetMap öffnen/i,
        });
        await expect(osmLink).toBeVisible();
        await expect(osmLink).toHaveAttribute('href', /openstreetmap\.org/);
        await expect(osmLink).toHaveAttribute('href', /47\.629072/);
        await expect(osmLink).toHaveAttribute('href', /7\.901672/);

        // Iframe should be hidden initially
        const mapIframe = page.locator('iframe[title="Standort DPSG Stamm St. Bernhard Wehr"]');
        await expect(mapIframe).toBeHidden();

        // Click to load map
        await loadMapBtn.click();

        // Iframe should now be visible with src set
        await expect(mapIframe).toBeVisible();
        const src = await mapIframe.getAttribute('src');
        expect(src).toContain('openstreetmap.org/export/embed.html');
        expect(src).toContain('marker=47.629072%2C7.901672');

        // Placeholder load button should now be hidden
        await expect(loadMapBtn).toBeHidden();
    });
});
