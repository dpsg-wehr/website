import { test, expect } from '@playwright/test';

import { ENABLE_MITGLIEDERPORTAL } from '../src/lib/config';

test('has title and navigates to the news page', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/DPSG Wehr/);

    await page.getByRole('link', { name: 'News' }).click();

    await expect(page).toHaveURL(/.*news/);

    await expect(page.getByRole('heading', { name: 'Aktuelles' })).toBeVisible();
});

test('navigates from footer to the internal links page and displays services', async ({ page }) => {
    await page.goto('/');

    const internLink = page.getByRole('link', { name: 'Intern' });
    await expect(internLink).toBeVisible();
    await internLink.click();

    await expect(page).toHaveURL(/.*intern/);
    await expect(page.getByRole('heading', { name: 'Interne Links' })).toBeVisible();

    await expect(page.getByRole('heading', { name: /Sveltia CMS/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Campflow/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /OpenCloud/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Jitsi Meet/i })).toBeVisible();

    await expect(page.getByRole('link', { name: /Sveltia CMS öffnen/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Campflow öffnen/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /OpenCloud öffnen/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Jitsi Meet öffnen/i })).toBeVisible();
});

test('displays campflow portal login button in navbar on desktop when enabled', async ({
    page,
}) => {
    await page.goto('/');

    const loginLink = page.locator('header').getByRole('link', { name: /Login/i });
    if (!ENABLE_MITGLIEDERPORTAL) {
        await expect(loginLink).toHaveCount(0);
        return;
    }

    await expect(loginLink).toBeVisible();
    await expect(loginLink).toHaveAttribute('href', 'https://on.campflow.de/dpsg-wehr/portal');
    await expect(loginLink).toHaveAttribute('target', '_blank');
    await expect(loginLink).toHaveAttribute('rel', 'noopener noreferrer');
});

test('navbar contains Anmeldung instead of Termine and navigates to Anmeldung', async ({
    page,
}) => {
    await page.goto('/');

    const header = page.locator('header');
    // Termine should not be in the navbar
    await expect(header.getByRole('link', { name: 'Termine' })).toHaveCount(0);

    // Anmeldung should be visible in navbar and navigate correctly
    const anmeldungLink = header.getByRole('link', { name: 'Anmeldung' });
    await expect(anmeldungLink).toBeVisible();
    await anmeldungLink.click();

    await expect(page).toHaveURL(/.*pages\/anmeldung/);
    await expect(page.getByRole('heading', { name: 'Anmeldung', exact: true })).toBeVisible();
});

test('disables browser DNS prefetching and prefetches internal links on hover without prefetching external links', async ({
    page,
}) => {
    await page.goto('/');

    // Check meta tag disabling speculative DNS prefetching
    const dnsMeta = page.locator('meta[http-equiv="x-dns-prefetch-control"]');
    await expect(dnsMeta).toHaveAttribute('content', 'off');

    // Hover over internal News link in navbar
    const newsLink = page.locator('header').getByRole('link', { name: 'News' });
    await newsLink.hover();

    // Verify Astro prefetcher creates a prefetch link (or low-priority fetch) for /news
    await expect(page.locator('link[rel="prefetch"][href*="news"]')).toBeAttached({
        timeout: 2000,
    });

    // Hover over external Facebook link in footer
    const facebookLink = page.locator('footer').getByRole('link', { name: 'Facebook' });
    await facebookLink.hover();

    // Give it a moment to ensure no external prefetch is created
    await page.waitForTimeout(300);
    const externalPrefetch = page.locator('link[rel="prefetch"][href*="facebook.com"]');
    await expect(externalPrefetch).toHaveCount(0);
});
