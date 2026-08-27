export function formatPostDate(date: string): string {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('de-DE', options);
}

/**
 * Returns the UTC offset string (e.g. '+01:00' or '+02:00') for Europe/Berlin on the specified date.
 */
export function getBerlinUtcOffset(date: Date): string {
    try {
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: 'Europe/Berlin',
            timeZoneName: 'shortOffset',
        });
        const parts = formatter.formatToParts(date);
        const offsetPart = parts.find((p) => p.type === 'timeZoneName');
        if (offsetPart && offsetPart.value.startsWith('GMT')) {
            const match = offsetPart.value.match(/GMT([+-]\d+)(?::(\d+))?/);
            if (match) {
                const signAndHour = match[1];
                const sign = signAndHour[0];
                const hour = signAndHour.slice(1).padStart(2, '0');
                const min = (match[2] || '00').padStart(2, '0');
                return `${sign}${hour}:${min}`;
            }
        }
    } catch {
        // Fallback if Intl is not supported in the current environment
    }
    return '+02:00';
}

/**
 * Normalizes a banner 'until' property (Date object, date string, or timestamp)
 * into an ISO 8601 string with explicit timezone offset for Europe/Berlin.
 * Date-only inputs (e.g. '2026-09-13') are set to expire at the end of that day (23:59:59).
 */
export function normalizeBannerUntil(rawUntil: unknown): string | undefined {
    if (!rawUntil) return undefined;

    if (rawUntil instanceof Date) {
        if (Number.isNaN(rawUntil.getTime())) return undefined;
        // If parsed as date-only YAML (UTC midnight), expire at end of that day in Berlin time
        if (
            rawUntil.getUTCHours() === 0 &&
            rawUntil.getUTCMinutes() === 0 &&
            rawUntil.getUTCSeconds() === 0 &&
            rawUntil.getUTCMilliseconds() === 0
        ) {
            const year = rawUntil.getUTCFullYear();
            const month = String(rawUntil.getUTCMonth() + 1).padStart(2, '0');
            const day = String(rawUntil.getUTCDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
            const offset = getBerlinUtcOffset(rawUntil);
            return `${dateStr}T23:59:59${offset}`;
        }
        return rawUntil.toISOString();
    }

    const str = String(rawUntil).trim();
    if (!str) return undefined;

    // Matches YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
        const approxDate = new Date(`${str}T12:00:00Z`);
        const offset = !Number.isNaN(approxDate.getTime())
            ? getBerlinUtcOffset(approxDate)
            : '+02:00';
        return `${str}T23:59:59${offset}`;
    }

    // Matches YYYY-MM-DDTHH:mm or YYYY-MM-DDTHH:mm:ss or YYYY-MM-DD HH:mm(:ss) without timezone
    if (/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2})?$/.test(str)) {
        const normalizedDateTime = str.replace(' ', 'T');
        const formattedTime =
            normalizedDateTime.length === 16 ? `${normalizedDateTime}:00` : normalizedDateTime;
        const approxDate = new Date(`${formattedTime.slice(0, 10)}T12:00:00Z`);
        const offset = !Number.isNaN(approxDate.getTime())
            ? getBerlinUtcOffset(approxDate)
            : '+02:00';
        return `${formattedTime}${offset}`;
    }

    // Standard date parsing check
    const parsed = new Date(str);
    if (!Number.isNaN(parsed.getTime())) {
        return str;
    }

    return undefined;
}
