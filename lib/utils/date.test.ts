import { describe, it, expect } from 'vitest';
import { formatPostDate, getBerlinUtcOffset, normalizeBannerUntil } from './date';

describe('formatPostDate', () => {
    it('formats a date string correctly in German', () => {
        const input = '2023-12-24';
        const result = formatPostDate(input);

        expect(result).toBe('24. Dezember 2023');
    });
});

describe('getBerlinUtcOffset', () => {
    it('returns +02:00 during summer time (CEST)', () => {
        const summerDate = new Date('2026-07-15T12:00:00Z');
        expect(getBerlinUtcOffset(summerDate)).toBe('+02:00');
    });

    it('returns +01:00 during winter time (CET)', () => {
        const winterDate = new Date('2026-01-15T12:00:00Z');
        expect(getBerlinUtcOffset(winterDate)).toBe('+01:00');
    });
});

describe('normalizeBannerUntil', () => {
    it('normalizes a summer date-only string to end of day in CEST (+02:00)', () => {
        expect(normalizeBannerUntil('2026-09-13')).toBe('2026-09-13T23:59:59+02:00');
    });

    it('normalizes a winter date-only string to end of day in CET (+01:00)', () => {
        expect(normalizeBannerUntil('2026-01-15')).toBe('2026-01-15T23:59:59+01:00');
    });

    it('normalizes a Date object parsed from date-only YAML (UTC midnight) to end of day in local offset', () => {
        const dateObjSummer = new Date('2026-09-13T00:00:00.000Z');
        expect(normalizeBannerUntil(dateObjSummer)).toBe('2026-09-13T23:59:59+02:00');

        const dateObjWinter = new Date('2026-01-15T00:00:00.000Z');
        expect(normalizeBannerUntil(dateObjWinter)).toBe('2026-01-15T23:59:59+01:00');
    });

    it('preserves full ISO string with timezone offset', () => {
        const iso = '2026-09-13T23:59:59+02:00';
        expect(normalizeBannerUntil(iso)).toBe(iso);
    });

    it('appends correct timezone offset for datetime string without offset', () => {
        expect(normalizeBannerUntil('2026-09-13T18:00:00')).toBe('2026-09-13T18:00:00+02:00');
        expect(normalizeBannerUntil('2026-01-15 18:00')).toBe('2026-01-15T18:00:00+01:00');
    });

    it('returns undefined for invalid or empty inputs', () => {
        expect(normalizeBannerUntil(undefined)).toBeUndefined();
        expect(normalizeBannerUntil('')).toBeUndefined();
        expect(normalizeBannerUntil('not-a-date')).toBeUndefined();
    });
});
