import { test, expect } from '@playwright/test';

test.describe('Photo Gallery', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/gallerie');
        await expect(page.locator('.react-photo-album')).toBeVisible({ timeout: 15000 });
    });

    test('should load the gallery with images', async ({ page }) => {
        // Wait for the gallery to be mounted (it uses client-side rendering)
        const gallery = page.locator('.react-photo-album');
        await expect(gallery).toBeVisible();

        // Check if images are present
        const images = gallery.locator('img');
        await expect(images.first()).toBeVisible();

        // Verify at least some images are loaded
        const count = await images.count();
        expect(count).toBeGreaterThan(0);
    });

    test('should open the lightbox when an image is clicked', async ({ page }) => {
        const firstImage = page.locator('.react-photo-album img').first();

        // Ensure image is visible and loaded
        await expect(firstImage).toBeVisible();
        await firstImage.scrollIntoViewIfNeeded();

        // Wait for image to be fully decoded
        await expect(async () => {
            const naturalWidth = await firstImage.evaluate(
                (img: HTMLImageElement) => img.naturalWidth
            );
            expect(naturalWidth).toBeGreaterThan(0);
        }).toPass();

        // Use force click to ensure it hits the image even if layout is shifting
        await firstImage.click({ force: true });

        // Check if the lightbox is visible
        const lightbox = page.locator('.yarl__container');
        await expect(lightbox).toBeVisible({ timeout: 10000 });

        // Check if the lightbox close button works
        // Using aria-label for better stability
        const closeButton = page.getByRole('button', { name: 'Close' });
        await closeButton.click();
        await expect(lightbox).not.toBeVisible();
    });

    test('should filter images by tags', async ({ page }) => {
        // 1. Wait for gallery to be mounted
        const album = page.locator('.react-photo-album');
        await expect(album).toBeVisible();

        const initialCount = await album.locator('img').count();
        expect(initialCount).toBeGreaterThan(0);

        // 2. Open the Filter section (Collapsible)
        await page.getByText('Filter').click();

        // 3. Interact with the "Jahr" react-select dropdown
        // React-select usually has a placeholder or we can find it by its container
        const yearSelect = page.locator('.my-react-select-container').filter({ hasText: 'Jahr' });
        await yearSelect.click();

        // 4. Select "2018" from the dropdown options
        await page.getByText('2018', { exact: true }).click();

        // 5. Wait for the gallery to update (filtering happens in a useEffect)
        // We wait for the count to be different from the initial count
        await expect(async () => {
            const currentCount = await page.locator('.react-photo-album img').count();
            expect(currentCount).not.toBe(initialCount);
        }).toPass();

        const filteredCount = await page.locator('.react-photo-album img').count();
        expect(filteredCount).toBeLessThan(initialCount);
        expect(filteredCount).toBeGreaterThan(0);

        // 6. Clear the filter by clicking the clear button (the 'x' in react-select)
        // or just clicking the selected tag's remove button
        await page.locator('.my-react-select__multi-value__remove').click();

        // 7. Verify count returns to initial
        await expect(page.locator('.react-photo-album img')).toHaveCount(initialCount);
    });
});
