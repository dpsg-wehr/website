# Website DPSG Wehr - Project Context

## Project Overview

This is the source code for the "DPSG Wehr" website, built with **Astro 7**. The site is **completely statically generated** (`output: "static"`) and deployed as a lightweight static container behind Traefik.

**Key Features:**

- **Static Site Generation (SSG):** Optimized for performance, simplicity, and zero runtime overhead.
- **Dynamic Routing:** Content is decoupled from logic. MDX files are stored in a central `content/` directory and rendered via dynamic Astro routes (`src/pages/`).
- **Automated SEO:** Social previews (Open Graph and Twitter Cards) are automatically generated for every page and post using content excerpts and metadata.
- **Automated Testing:** Comprehensive suite including Unit, Component, and E2E tests with unified reporting.
- **Image Optimization:** Uses Astro's built-in `astro:assets` and Sharp engine, optimizing images automatically into modern WebP formats at build time.

## Tech Stack

- **Framework:** [Astro](https://astro.build) (v7)
- **Language:** [TypeScript](https://www.typescriptlang.org)
- **Styling:** [Tailwind CSS](https://tailwindcss.com) v4, [React Icons](https://react-icons.github.io/react-icons/)
- **Content:** Astro MDX integration (`@astrojs/mdx`), `gray-matter` for frontmatter.
- **Testing:** [Vitest](https://vitest.dev/) (Unit/Component), [Playwright](https://playwright.dev/) (E2E), [Monocart Reporter](https://github.com/cenfun/monocart-reporter).
- **Package Manager:** [pnpm](https://pnpm.io)

## Directory Structure

- `src/`: Application source directory (`components/`, `lib/`, `types/`, `pages/`, `layouts/`, `styles/`, `assets/`).
- `content/`: Raw content managed as MDX and JSON files (Sveltia/Decap CMS compatible).
- `docs/`: Project documentation.
- `e2e/`: Playwright end-to-end test suite.
- `public/`: Static web assets.
- `scripts/`: Utility scripts (`generate-ics.ts`, `generate-search-index.ts`, `run-lighthouse.ts`).
- `docker-compose.yml`: VPS deployment config.
- `nginx.conf`: Nginx config for static file serving, caching, and security headers.

## Development & Testing

### Key Commands

- **Start Development Server:** `pnpm dev` (Runs Astro dev server at `http://localhost:3000`).
- **Run Unit Tests:** `pnpm test` (Vitest watch mode).
- **Run E2E Tests:** `pnpm test:e2e` (Playwright).
- **Run All Tests:** `pnpm test:all` (Sequential Vitest + Playwright).
- **Typecheck:** `pnpm typecheck` (`astro check && tsc --noEmit`).
- **Lint:** `pnpm lint` (ESLint).
- **Build:** `pnpm build` (Static export to `out/`).

## Release & Deployment Workflow

1. **CI/CD with Forgejo Actions (`.forgejo/workflows/deploy.yaml`):**
    - Triggered on push to `main` or `dev`.
    - Builds static website and optimizes images with `pnpm build`.
    - Packages into lightweight `nginx:alpine` image (`Dockerfile.static`).
    - Streams Docker image directly to the VPS over Tailscale SSH (`docker save | ssh docker load`) and runs `docker compose up -d` with rolling updates.
2. **VPS Minimal Deployment:**
    - VPS only maintains `docker-compose.yml`, `.env`, and `public/generated`.
    - `website` serves production (`dpsg-wehr.de`).
    - `website-dev` serves dev preview (`dev.dpsg-wehr.de`) routed via Traefik behind Authentik forward-auth middleware.
