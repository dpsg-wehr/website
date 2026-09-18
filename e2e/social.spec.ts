import { test, expect } from '@playwright/test';

test.describe('Social Metadata', () => {
    test('should have Open Graph tags', async ({ page }) => {
        await page.goto('/');

        // Open Graph
        await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
            'content',
            'DPSG Wehr'
        );
        await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
            'content',
            'Website der DPSG Wehr'
        );
        await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
            'content',
            'website'
        );
        await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
            'content',
            /.*logo\.png/
        );
    });

    test('should have Twitter Card tags', async ({ page }) => {
        await page.goto('/');

        // Twitter
        await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
            'content',
            'summary_large_image'
        );
        await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute(
            'content',
            'DPSG Wehr'
        );
        await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute(
            'content',
            /.*logo\.png/
        );
    });

    test('should have metadata for Wölflinge', async ({ page }) => {
        await page.goto('/pages/gruppen/woelflinge');

        await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
            'content',
            'Wölflinge - DPSG Wehr'
        );
    });

    test('should have optimized image for scoutfactory post', async ({ page }) => {
        await page.goto('/posts/scoutfactory');

        await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
            'content',
            /(?:_astro\/.*\.webp|_image\?.*f=webp)/
        );
        await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute(
            'content',
            '1200'
        );
    });
});
