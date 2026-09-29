import { test, expect } from '@playwright/test';
import { navigationLinks } from '../src/lib/config';

const groups = navigationLinks.find((n) => n.label === 'Gruppen')?.links || [];

test.describe('Group Pages', () => {
    for (const group of groups) {
        test(`should load the ${group.label} page correctly`, async ({ page }) => {
            await page.goto('/');

            await page.goto(group.link);

            // 3. Verify the heading matches the group label
            // For Leiterrunde, the heading inside GroupOverview is just "Leiter"
            const expectedHeading = group.label === 'Leiterrunde' ? 'Leiter' : group.label;
            await expect(
                page.getByRole('heading', { name: expectedHeading, level: 2 })
            ).toBeVisible();

            // 5. Verify images are present and loading
            const firstImage = page.locator('img').first();
            await expect(firstImage).toBeVisible();

            // Use a polling check for naturalWidth to give CI more time
            await expect(async () => {
                const naturalWidth = await firstImage.evaluate(
                    (img: HTMLImageElement) => img.naturalWidth
                );
                expect(naturalWidth).toBeGreaterThan(0);
            }).toPass({
                intervals: [500, 1000, 2000],
                timeout: 10000,
            });

            // 6. Verify CMS edit link is present
            const editButton = page.getByTestId('cms-edit-button');
            await expect(editButton).toBeVisible();
            await expect(editButton).toHaveAttribute(
                'href',
                /https:\/\/dev\.dpsg-wehr\.de\/admin\/#\/collections\/gruppen\/entries\//
            );
        });
    }
});
