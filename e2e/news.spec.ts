import { test, expect } from '@playwright/test';

test.describe('News Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/news');
    });

    test('should display the news heading', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Aktuelles' })).toBeVisible();
    });

    test('should provide an RSS auto-discovery link and RSS button', async ({ page, request }) => {
        // Auto-discovery <link> in head
        const rssLink = page.locator('link[rel="alternate"][type="application/rss+xml"]');
        await expect(rssLink).toHaveCount(1);
        await expect(rssLink).toHaveAttribute('href', /https?:\/\/[^/]+\/rss\.xml/);
        await expect(rssLink).toHaveAttribute('title', 'DPSG Stamm Wehr - Aktuelles');

        // RSS button on the news page
        const rssButton = page.getByRole('link', { name: 'RSS-Feed' }).first();
        await expect(rssButton).toBeVisible();
        await expect(rssButton).toHaveAttribute('href', '/rss.xml');

        // Fetch /rss.xml directly and verify content
        const rssResponse = await request.get('/rss.xml');
        expect(rssResponse.status()).toBe(200);
        const rssText = await rssResponse.text();
        expect(rssText).toContain('xml-stylesheet');
        expect(rssText).toContain('/rss-style.xsl');
        expect(rssText).toContain('<rss version="2.0"');
        expect(rssText).toContain('<title>DPSG Stamm Wehr - Aktuelles</title>');
        expect(rssText).toContain('<language>de</language>');
        expect(rssText).toContain('/posts/');
        expect(rssText).toContain('<content:encoded>');

        // Verify stylesheet is accessible
        const xslResponse = await request.get('/rss-style.xsl');
        expect(xslResponse.status()).toBe(200);
        const xslText = await xslResponse.text();
        expect(xslText).toContain('xsl:stylesheet');
    });

    test('should list news posts and navigate to a post', async ({ page }) => {
        const posts = page.locator('article');
        const count = await posts.count();

        if (count > 0) {
            const firstPost = posts.first();
            const postTitle = await firstPost.locator('h2').innerText();

            // Click the first post
            await firstPost.click();

            // Verify navigation
            await expect(page).toHaveURL(/\/posts\//);

            // Wait a bit for rendering to settle
            await page.waitForTimeout(500);

            // Just check that an h1 exists and is visible (the title)
            await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });

            // Verify automated metadata
            // Use specific selector including content to avoid matching old/stale meta tags during transition
            const metaTitle = page.locator(
                `meta[property="og:title"][content="${postTitle} - DPSG Wehr"]`
            );
            await expect(metaTitle).toHaveCount(1);

            await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
                'content',
                'article'
            );

            // Verify CMS edit button is present and links to the dev CMS URL
            const editButton = page.getByTestId('cms-edit-button');
            await expect(editButton).toBeVisible();
            await expect(editButton).toHaveAttribute(
                'href',
                /https:\/\/dev\.dpsg-wehr\.de\/admin\/#\/collections\/posts\/entries\//
            );
        } else {
            // If no posts, verify the empty state message
            await expect(page.getByText("Hier gibt's noch nichts zu sehen.")).toBeVisible();
        }
    });
});
