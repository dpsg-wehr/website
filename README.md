# Website der DPSG Wehr

![Astro](https://img.shields.io/badge/Astro-7-orange?logo=astro&logoColor=white)

Hier findet ihr den Quellcode zu unserer Homepage. Die Website wurde mit [Astro](https://astro.build) (v7) entwickelt und wird komplett statisch generiert.

## Entwicklung

### Tools verwalten mit mise

Dieses Projekt verwendet [mise](https://mise.jdx.sh/) zur Verwaltung von Entwicklungs-Tools (Node.js, pnpm). Wenn mise installiert ist, werden die richtigen Versionen automatisch beim Öffnen des Verzeichnisses aktiviert (oder können mit `mise install` installiert werden).

Die Nutzung von mise muss ggf. mit `mise trust` erlaubt werden.

## Generieren der Website

Zum Generieren der Website werden [git](https://git-scm.com/) und [pnpm](https://pnpm.io/installation) benötigt. Sie kann mit den folgenden Befehlen erstellt werden:

```bash
# Repository klonen
git clone https://github.com/dpsg-wehr/website.git

# In Ordner wechseln
cd website

# Abhängigkeiten installieren
pnpm install

# Website generieren
pnpm build
```

Die generierte Website wird im Ordner `out` gespeichert. Zur Entwicklung kann ein lokaler Server gestartet werden:

```bash
pnpm dev
```

Die Website ist dann unter [http://localhost:3000](http://localhost:3000) verfügbar.

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

## Bereitstellung (Deployment)

Die Bereitstellung erfolgt vollautomatisch über Forgejo Actions. Jeder Push auf den Branch `dev` baut ein Test-Image, welches über Tailscale SSH auf den Server übertragen und mit `docker compose up -d` aktualisiert wird. Bei Änderungen auf `main` wird zusätzlich über Semantic Release eine Versionierung vorgenommen und die Produktivumgebung aktualisiert.
