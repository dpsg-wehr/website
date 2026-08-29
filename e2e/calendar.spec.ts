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
        });

        await page.goto('/pages/termine');

        // 1. Wait for calendar to be visible
        await expect(page.getByRole('grid')).toBeVisible();

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
});
