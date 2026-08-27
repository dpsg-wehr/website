import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const pagesToTest = [
    { name: 'Home', path: '/' },
    { name: 'News', path: '/news' },
    { name: 'Gallery', path: '/gallerie' },
    { name: 'Subscribe', path: '/subscribe' },
    { name: 'Impressum', path: '/pages/impressum' },
    { name: 'Datenschutz', path: '/pages/datenschutz' },
];

test.describe('Accessibility (a11y) Audits', () => {
    for (const pageInfo of pagesToTest) {
        test(`should not have automatically detectable accessibility issues on ${pageInfo.name}`, async ({
            page,
        }) => {
            await page.goto(pageInfo.path);

            const accessibilityScanResults = await new AxeBuilder({ page })
                .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
                .analyze();

            expect(accessibilityScanResults.violations).toEqual([]);
        });
    }
});
