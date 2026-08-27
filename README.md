# Website der DPSG Wehr

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white)

Hier findet ihr den Quellcode zu unserer Homepage. Die Website wurde mit [Next.js](https://nextjs.org) entwickelt und wird komplett statisch generiert.

## Entwicklung

### Tools verwalten mit mise

Dieses Projekt verwendet [mise](https://mise.jdx.sh/) zur Verwaltung von Entwicklungs-Tools (Node.js, pnpm). Wenn mise installiert ist, werden die richtigen Versionen automatisch beim Öffnen des Verzeichnisses aktiviert (oder können mise `mise install` installiert werden).

Die Nutzung von mise muss ggf. mit `mise trust` erlaubt werden.

## Generieren der Website

Zum generieren der Website werden [git](https://git-scm.com/) und [pnpm](https://pnpm.io/installation) benötigt. Sie kann mit den folgenden Befehlen erstellt werden.

```bash
# Repository klonen
git clone https://github.com/Linus-f/website-dpsg-wehr.git

# In Ordnder wechseln
cd website-dpsg-wehr

# Abhängigkeiten installieren
pnpm install

# Website generieren
pnpm export
```

Die generierte Website wird im Ordner `out` gespeichert. Zur Entwicklung kann ein lokaler server gestartet werden:

```bash
pnpm dev
```

Die Website ist dann unter [http://localhost:3000](http://localhost:3000) verfügbar. Falls einige Bilder nicht geladen werden können, müssen die optimierten Versionen erst mit `pnpm export` generiert werden.

## Testing

Das Projekt verfügt über eine automatisierte Testsuite, die Unit-Tests, Komponenten-Tests und End-to-End (E2E) Tests umfasst.

### Tests ausführen

```bash
# Unit- & Komponenten-Tests (Vitest) im Watch-Mode
pnpm test

# E2E-Tests (Playwright)
pnpm test:e2e

# E2E-Tests im interaktiven UI-Modus
pnpm test:e2e:ui

# Alle Tests einmalig ausführen
pnpm test:all
```

### Reports & Abdeckung

```bash
# Testabdeckung (Coverage) anzeigen
pnpm test --coverage

# Playwright Test-Report öffnen
npx playwright show-report

# Lokale Test-Ergebnisse (Monocart) im Browser ansehen
pnpm test:report
```

## Kalender & ICS Generierung

Die Website generiert automatisch ICS-Kalenderdateien für Termine.

- **Öffentliche Termine**: Werden in `lib/events.public.ts` gepflegt und sind im Repository enthalten.
- **Interne Termine**: Können in einer lokalen Datei `lib/events.internal.ts` definiert werden. Diese Datei wird von Git ignoriert (`.gitignore`).

**Format für `lib/events.internal.ts`:**

```typescript
import { AppEvent } from '../types';

export const internalEvents: AppEvent[] = [
    {
        title: 'Leiterrunde',
        start: '2024-01-01',
        //optional: end: "2024-01-01"
    },
];
```

Die Kalender werden automatisch vor dem Build (`pnpm build`) generiert:

1.  `public/events.ics`: Enthält nur öffentliche Termine.
2.  `public/internal-events.ics`: Enthält öffentliche und interne Termine (falls `events.internal.ts` existiert).

Beide generierten `.ics` Dateien sind ebenfalls in `.gitignore` und werden nicht committed.

## Lizenz

Der Quellcode dieses Projekts ist unter der **MIT Lizenz** veröffentlicht. Siehe [LICENSE](LICENSE) für Details.

**Hinweis zum Inhalt:**
Die Inhalte in den Ordnern `content/` und `public/` (Texte, Bilder, Grafiken) sind Eigentum der DPSG Wehr und unterliegen dem Urheberrecht. Sie sind **nicht** Teil der Open-Source-Lizenz und dürfen nicht ohne Genehmigung weiterverwendet werden.
