import { test, expect } from '@playwright/test';
import publicEvents from '../content/events/public.json';

test.describe('Calendar', () => {
    test.use({
        locale: 'de-DE',
        timezoneId: 'Europe/Berlin',
    });

    test('should render the calendar and show events', async ({ page }) => {
        // Mock the date to 2024 to match the current event data
        await page.addInitScript(() => {
            const mockDate = new Date('2024-05-15T12:00:00').getTime();
            const NativeDate = window.Date;
            window.Date = class extends NativeDate {
                constructor(...args: unknown[]) {
                    if (args.length === 0) {
                        super(mockDate);
                    } else {
                        super(...(args as [string | number | Date]));
                    }
                }
            } as unknown as typeof Date;
            window.Date.now = () => mockDate;
            try {
                delete (window as unknown as { Temporal?: unknown }).Temporal;
            } catch {
                // ignore
            }
        });

        await page.goto('/pages/termine');

        // 1. Wait for calendar to be visible
        await expect(page.getByRole('table')).toBeVisible({ timeout: 15000 });

        // 2. Switch to list view
        await page
            .getByRole('tab', { name: 'Liste' })
            .or(page.getByRole('button', { name: 'Liste' }))
            .click();

        // 3. Verify that an event from the list is rendered
        if (publicEvents.length > 0) {
            const sampleEvent =
                publicEvents.find((e) => e.start.startsWith('2024')) || publicEvents[0];
            await expect(page.getByText(sampleEvent.title).first()).toBeVisible();
        }
    });

    test('should respect theme toggle and update calendar colors', async ({ page }) => {
        await page.goto('/pages/termine');
        await expect(page.getByRole('table')).toBeVisible({ timeout: 15000 });

        const getStyles = async () => {
            return await page.evaluate(() => {
                const el = document.querySelector('.fc-classic-Jk3');
                const cs = el ? window.getComputedStyle(el) : null;
                return {
                    bg: cs?.backgroundColor,
                    color: cs?.color,
                    borderColor: cs?.borderColor,
                    classicBgVar: cs?.getPropertyValue('--fc-classic-background'),
                };
            });
        };

        const light = await getStyles();
        expect(light.bg).toBe('rgb(255, 255, 255)');
        expect(light.color).toBe('rgb(17, 24, 39)');

        // Check light mode button styles
        const lightButton = await page.evaluate(() => {
            const btn = document.querySelector('#calendar-root button');
            const cs = btn ? window.getComputedStyle(btn) : null;
            return {
                borderTop: cs?.borderTopWidth,
                borderBottom: cs?.borderBottomWidth,
                color: cs?.color,
            };
        });
        expect(lightButton.borderTop).toBe('1px');
        expect(lightButton.borderBottom).toBe('1px');

        // Toggle to dark mode
        await page.getByRole('button', { name: 'Toggle dark mode' }).click();
        await expect(page.locator('html')).toHaveClass(/dark/);

        const dark = await getStyles();
        expect(dark.bg).toBe('rgb(31, 41, 55)');
        expect(dark.color).toBe('rgb(249, 250, 251)');

        // Check dark mode button styles
        const darkButton = await page.evaluate(() => {
            const btn = document.querySelector('#calendar-root button');
            const cs = btn ? window.getComputedStyle(btn) : null;
            return {
                borderTop: cs?.borderTopWidth,
                borderBottom: cs?.borderBottomWidth,
                color: cs?.color,
            };
        });
        expect(darkButton.borderTop).toBe('1px');
        expect(darkButton.borderBottom).toBe('1px');

        // Toggle back to light mode
        await page.getByRole('button', { name: 'Toggle dark mode' }).click();
        await expect(page.locator('html')).not.toHaveClass(/dark/);

        const restoredLight = await getStyles();
        expect(restoredLight.bg).toBe('rgb(255, 255, 255)');
        expect(restoredLight.color).toBe('rgb(17, 24, 39)');
    });
});
