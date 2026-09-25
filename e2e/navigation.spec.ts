import { test, expect } from '@playwright/test';

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
