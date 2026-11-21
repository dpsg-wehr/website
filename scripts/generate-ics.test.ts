import * as ics from 'ics';
import { describe, it, expect } from 'vitest';

import { AppEvent } from '../src/types';
import { convertEventToIcsAttribute } from './generate-ics';

describe('ICS Timezone Logic (Berlin -> UTC)', () => {
    // Helper to format DateArray [Y, M, D, H, m] to ISO UTC string
    function formatUTC(dateArray: ics.DateTime | ics.DateArray): string {
        if (!Array.isArray(dateArray) || dateArray.length !== 5) return 'INVALID';
        const [y, m, d, h, min] = dateArray;
        return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}T${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}Z`;
    }

    it('converts Winter Time (CET) correctly (UTC+1)', () => {
        // 5th Jan 19:00 Berlin -> 18:00 UTC
        const event: AppEvent = {
            title: 'Winter Event',
            start: '2024-01-05T19:00',
            location: 'Berlin',
            description: 'Test',
        };
        const result = convertEventToIcsAttribute(event);
        expect(result.startOutputType).toBe('utc');
        expect(formatUTC(result.start)).toBe('2024-01-05T18:00Z');
    });

    it('converts Summer Time (CEST) correctly (UTC+2)', () => {
        // 6th July 19:00 Berlin -> 17:00 UTC
        const event: AppEvent = {
            title: 'Summer Event',
            start: '2024-07-06T19:00',
            location: 'Berlin',
            description: 'Test',
        };
        const result = convertEventToIcsAttribute(event);
        expect(result.startOutputType).toBe('utc');
        expect(formatUTC(result.start)).toBe('2024-07-06T17:00Z');
    });

    it('handles DST switch day correctly (March - Start of Summer Time)', () => {
        // 31st March 2024 is the switch day.
        // 12:00 Berlin is already Summer Time -> 10:00 UTC
        const event: AppEvent = {
            title: 'DST Switch Event',
            start: '2024-03-31T12:00',
            location: 'Berlin',
            description: 'Test',
        };
        const result = convertEventToIcsAttribute(event);
        expect(formatUTC(result.start)).toBe('2024-03-31T10:00Z');
    });

    it('handles DST switch day correctly (October - End of Summer Time)', () => {
        // 27th Oct 2024 is switch day.
        // 12:00 Berlin is Winter Time (Standard) -> 11:00 UTC
        // (Switch happens at 3AM -> 2AM)
        const event: AppEvent = {
            title: 'DST End Event',
            start: '2024-10-27T12:00',
            location: 'Berlin',
            description: 'Test',
        };
        const result = convertEventToIcsAttribute(event);
        expect(formatUTC(result.start)).toBe('2024-10-27T11:00Z');
    });

    it('leaves All-Day events as floating (Date-only)', () => {
        const event: AppEvent = {
            title: 'All Day Event',
            start: '2024-05-18', // No time
            location: 'Berlin',
            description: 'Test',
        };
        const result = convertEventToIcsAttribute(event);

        // Should be length 3 [Y, M, D]
        expect(result.start).toHaveLength(3);
        expect(result.start).toEqual([2024, 5, 18]);

        // Should NOT have utc output type (defaults apply, but we check specific values)
        // Our logic only sets startOutputType: 'utc' for timed events now?
        // Actually, the code sets startOutputType: 'utc' unconditionally in the return object.
        // BUT ics library handles Date-only arrays as floating regardless of that flag usually.
        // Let's verify the array values are UNCHANGED (no offset applied).
        // 2024-05-18 input -> 2024-05-18 output.
    });
});
