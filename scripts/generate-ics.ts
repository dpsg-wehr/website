import * as ics from 'ics';
import * as fs from 'fs';
import * as path from 'path';
import publicEvents from '../content/events/public.json';
import internalEvents from '../content/events/internal.example.json'; // We use example here as we don't have the real one
import { AppEvent } from '../types';

// This script generates ICS files from the events defined in the codebase.
// It is run as part of the build process.

function parseDate(dateStr: string): ics.DateArray {
    // Normalize separator to space (handles "YYYY-MM-DDTHH:mm" and "YYYY-MM-DD HH:mm")
    const normalized = dateStr.replace('T', ' ');
    const [datePart, timePart] = normalized.split(' ');
    const [year, month, day] = datePart.split('-').map(Number);

    if (timePart) {
        const [hour, minute] = timePart.split(':').map(Number);
        return [year, month, day, hour, minute];
    }
    return [year, month, day];
}

// Helper to determine if a date is in Daylight Saving Time (CEST) for Berlin
// Berlin switches to DST (UTC+2) on last Sunday of March at 2:00
// Berlin switches back to Standard (UTC+1) on last Sunday of October at 3:00
function getBerlinOffset(year: number, month: number, day: number, hour: number): number {
    const date = new Date(Date.UTC(year, month - 1, day, hour));

    // Last Sunday of March
    const marchNode = new Date(Date.UTC(year, 2, 31));
    const startDst = new Date(Date.UTC(year, 2, 31 - marchNode.getDay(), 1)); // 2:00 Local = 1:00 UTC

    // Last Sunday of October
    const octNode = new Date(Date.UTC(year, 9, 31));
    const endDst = new Date(Date.UTC(year, 9, 31 - octNode.getDay(), 1)); // 3:00 Local (shifted) = 1:00 UTC

    // If between start and end of DST, it's UTC+2, otherwise UTC+1
    return date >= startDst && date < endDst ? 2 : 1;
}

function toBerlinUTC(dateArray: ics.DateArray): ics.DateArray {
    if (dateArray.length < 5) return dateArray; // Date-only, return as is

    const [y, m, d, h, min] = dateArray as [number, number, number, number, number];
    const offset = getBerlinOffset(y, m, d, h);

    // Create date in UTC
    const date = new Date(Date.UTC(y, m - 1, d, h - offset, min));

    return [
        date.getUTCFullYear(),
        date.getUTCMonth() + 1,
        date.getUTCDate(),
        date.getUTCHours(),
        date.getUTCMinutes(),
    ];
}

export function convertEventToIcsAttribute(event: AppEvent): ics.EventAttributes {
    let start = parseDate(event.start);
    let end = event.end ? parseDate(event.end) : undefined;

    // Convert to UTC if it contains time
    if (start.length === 5) {
        start = toBerlinUTC(start);
    }
    if (end && end.length === 5) {
        end = toBerlinUTC(end);
    }

    const attributes: ics.EventAttributes = {
        start: start,
        // startInputType: 'utc', // Default is UTC if we don't specify local
        startOutputType: 'utc', // Force output to have 'Z'
        title: event.title,
        location: event.location,
        description: event.description,
        duration: { days: 1 }, // Default duration
    };

    if (end) {
        const { duration: _duration, ...rest } = attributes;
        return {
            ...rest,
            end: end,
        };
    } else {
        if (start.length === 5) {
            attributes.duration = { hours: 1 };
        }
        return attributes;
    }
}
function generateIcs(events: AppEvent[], filename: string) {
    const icsEvents = events.map(convertEventToIcsAttribute);

    const { error, value } = ics.createEvents(icsEvents);

    if (error) {
        console.error(`Error generating ICS for ${filename}:`, error);
        return;
    }

    if (value) {
        const filePath = path.join(process.cwd(), 'public', filename);
        fs.writeFileSync(filePath, value);
        console.log(`Generated ${filePath}`);
    }
}

export async function generateAll() {
    // Ensure the directory exists
    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
    }

    // Generate public events
    generateIcs(publicEvents, 'events.ics');

    // Determine internal events filename
    const internalIcsToken = process.env.INTERNAL_ICS_TOKEN;
    const internalFilename = internalIcsToken
        ? `internal-events-${internalIcsToken}.ics`
        : 'internal-events.ics';

    // Try to generate internal events if the file exists
    const internalJsonPath = path.join(process.cwd(), 'content/events/internal.json');
    const legacyInternalEventsPath = path.join(process.cwd(), 'lib/events.internal.ts');
    if (fs.existsSync(internalJsonPath)) {
        console.log('Found internal events JSON file.');
        try {
            const raw = fs.readFileSync(internalJsonPath, 'utf8');
            const data = JSON.parse(raw);
            generateIcs(data, internalFilename);
        } catch (err) {
            console.error('Error loading internal events JSON:', err);
        }
    } else if (fs.existsSync(legacyInternalEventsPath)) {
        console.log('Found internal events TS file.');
        const modulePath = '../lib/events.internal';
        try {
            const m = await import(modulePath);
            generateIcs(m.internalEvents, internalFilename);
        } catch (err) {
            console.error('Error loading internal events:', err);
        }
    } else {
        console.log('No internal events file found, using example.');
        generateIcs(internalEvents, internalFilename);
    }
}

// Only run if the script is executed directly
const isMain = process.argv[1]?.endsWith('generate-ics.ts');
if (isMain) {
    generateAll().catch((err) => console.error(err));
}
