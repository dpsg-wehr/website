# Internal Calendar Management

This project supports a dual-calendar system:

1. **Public Calendar:** Visible to everyone on the website.
2. **Internal Calendar:** Contains internal dates (e.g., Leiterrunden) and is hidden from the public.

## Architecture

- **Public Events:** Stored in `lib/events.public.ts`. This file is committed to Git.
- **Internal Events:** Stored in `lib/events.internal.ts`. **This file is git-ignored** to prevent accidental leaks of sensitive data.

During the build process (`scripts/generate-ics.ts`), two ICS files are generated in the `public/` directory:

1. `events.ics` (Public)
2. `internal-events-[TOKEN].ics` (Internal + Public events combined)

## Security Mechanism

To prevent unauthorized access to the internal calendar, the filename is randomized using a secret token.

1. An environment variable `INTERNAL_ICS_TOKEN` is set on the server (in `.env`).
2. The build script reads this token and generates the file as `public/internal-events-[YOUR_TOKEN].ics`.
3. The server (Nginx) serves this file like any other static asset.

**Note:** The internal calendar link is **never** linked anywhere on the website. It must be distributed manually.

## How to Manage Internal Events

Since `lib/events.internal.ts` is not in Git, you cannot update it via a standard `git push`.

### 1. Edit Locally

Create or edit `lib/events.internal.ts` on your local machine:

```typescript
// lib/events.internal.ts
import { AppEvent } from '../types';

export const internalEvents: AppEvent[] = [
    {
        title: 'Internal Meeting',
        start: '2024-01-01 14:00',
        end: '2024-01-02 16:30', // Optional
        location: 'Wehr',
        description: 'example',
    },
    // ... more events
];
```

### 2. Deploy to VPS

You must securely transfer the file to the production server. Use `scp` (Secure Copy):

```bash
# Replace with your actual user/server details
scp lib/events.internal.ts user@dpsg-wehr.de:/path/to/website-dpsg-wehr/lib/events.internal.ts
```

### 3. Rebuild

Trigger a rebuild on the server so the new ICS file is generated.

```bash
# On the VPS
docker compose up -d website
# OR trigger your deployment webhook
```

## How to Subscribe

1. Construct the URL: `https://dpsg-wehr.de/internal-events-[TOKEN].ics`
   (You can find the `[TOKEN]` in the `.env` file on the server).
2. Add this URL to your calendar app (Google Calendar, Apple Calendar, Outlook) as a "Subscribed Calendar" or "Network Calendar".
